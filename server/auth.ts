import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage"; // storage örneğinin doğru şekilde export edildiğini varsayıyoruz
import { User as SelectUser } from "@shared/schema";
import { db } from "./db";
import { users, insertUserSchema, passwordResets } from "@shared/schema";
import crypto from 'crypto';
import { sendVerificationEmail, sendEmail } from './email';
import { eq, and, gt } from "drizzle-orm";
import { comparePasswords } from "./utils.js";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export function setupAuth(app: Express) {
  // Oturum gizli anahtarı için çevre değişkeni veya varsayılan değer kullan
  const sessionSecret = process.env.SESSION_SECRET || "shopease-secret-key";

  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore, // storage.sessionStore'un doğru başlatıldığından emin ol
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 gün
      // Üretim ortamında secure: true olmalı (HTTPS üzerinden)
      secure: process.env.NODE_ENV === "production",
      // SameSite=Lax genellikle iyi bir başlangıç noktasıdır
      // sameSite: 'lax',
      // httpOnly: true, // Tarayıcı JavaScript'inin cookie'ye erişmesini engeller (önerilir)
    }
  };

  // Proxy arkasında çalışıyorsa (örneğin Nginx, Heroku)
  if (process.env.NODE_ENV === 'production') {
      app.set('trust proxy', 1); // İlk proxy'ye güven
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: 'username' }, // 'username' alanını kullan
      async (username, password, done) => {
        try {
          // Tutarlılık için storage katmanını kullan (DatabaseStorage varsayılıyor)
          const user = await storage.getUserByUsername(username);

          if (!user) {
            return done(null, false, { message: 'Incorrect username or password.' });
          }

          // Şifreleri karşılaştır (hash formatını comparePasswords halletmeli)
          const isMatch = await comparePasswords(user.password, password);
          if (!isMatch) {
            return done(null, false, { message: 'Incorrect username or password.' });
          }

          // E-posta doğrulaması kontrolü
          if (!user.emailVerified) {
            // Özel mesaj kodu gönder, istemci tarafında yakalanabilir
            return done(null, false, { message: 'EMAIL_NOT_VERIFIED' });
          }

          // Başarılı kimlik doğrulama, kullanıcı nesnesini döndür
          // Döndürülen nesnenin Express.User ile uyumlu olduğundan emin ol
          return done(null, user as Express.User);
        } catch (err) {
          console.error("LocalStrategy error:", err); // Hata loglaması
          return done(err); // Hatayı Passport'a ilet
        }
      }
    ),
  );

  // Kullanıcı ID'sini oturuma kaydet
  passport.serializeUser((user, done) => {
    // user nesnesinin bir 'id' özelliği olduğundan emin ol
    if (user && 'id' in user) {
      done(null, user.id);
    } else {
      console.error("Serialization error: User object missing id", user);
      done(new Error('User object missing id for serialization'));
    }
  });

  // Kullanıcı ID'sini oturumdan alıp tam kullanıcı nesnesini yükle
  passport.deserializeUser(async (id: unknown, done) => {
    // Gelen ID'nin bir sayı olduğundan emin ol
    if (typeof id !== 'number') {
        console.error(`Deserialization error: Expected ID to be a number, but received ${typeof id}`, id);
        return done(new Error('Invalid user ID type in session'));
    }

    try {
      // Storage katmanından kullanıcıyı getir
      const user = await storage.getUser(id);

      if (!user) {
        // Kullanıcı veritabanında bulunamadı (belki silindi?), oturumdan çıkarılmış gibi davran
        console.warn(`User with ID ${id} not found during deserialization.`);
        // Hata değil, kullanıcı bulunamadı durumu. false Passport'a oturumu temizlemesini söyler.
        return done(null, false);
      }

      // Kullanıcı bulundu, devam et
      // Döndürülen nesnenin Express.User ile uyumlu olduğundan emin ol
      done(null, user as Express.User);
    } catch (err) {
      // storage.getUser'dan gelen asıl hatayı logla
      console.error(`Failed to deserialize user with ID ${id}:`, err);
      done(err); // Hatayı Passport'a ilet
    }
  });

  // Kullanıcı Kayıt Endpoint'i
  app.post("/api/auth/register", async (req, res, next) => {
    try {
      // 1. Girdi verisini doğrula
      const validationResult = insertUserSchema.safeParse(req.body);
      if (!validationResult.success) {
        // Detaylı validasyon hataları döndür
        return res.status(400).json({ message: "Validation failed", errors: validationResult.error.flatten().fieldErrors });
      }
      const { username, email, password, fullName, address } = validationResult.data;

      // 2. Kullanıcı adı veya e-posta zaten var mı kontrol et (storage katmanıyla)
      const existingUserByUsername = await storage.getUserByUsername(username);
      if (existingUserByUsername) {
        return res.status(409).json({ message: "Username already exists" });
      }
      const existingUserByEmail = await storage.getUserByEmail(email);
        if (existingUserByEmail) {
        return res.status(409).json({ message: "Email already exists" });
      }

      // 3. Şifreyi hashle
      const hashedPassword = await hashPassword(password);

      // 4. Doğrulama token'ı oluştur
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 saat sonra

      // 5. Kullanıcıyı veritabanına ekle (doğrulanmamış olarak)
      // storage.createUser metodunun bu alanları kabul ettiğinden emin ol ya da doğrudan db kullan
      // Önceki gibi doğrudan db insert varsayılıyor
       await db.insert(users).values({
         username,
         email,
         password: hashedPassword,
         fullName,
         address,
         emailVerified: false, // Önemli: Başlangıçta false
         emailVerificationToken: verificationToken,
         verificationTokenExpiresAt: tokenExpiry,
         isAdmin: false, // Varsayılan olarak admin değil
         // Şemadaki diğer gerekli alanların varsayılan değerleri olduğundan emin ol
       });

      // 6. Doğrulama e-postası gönder
      try {
        await sendVerificationEmail(email, verificationToken);
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
        // E-posta hatası durumunda ne yapılacağına karar ver (kaydı geri al? kullanıcıya bildir?)
        // Şimdilik sadece logluyoruz, kayıt devam ediyor.
      }

      // 7. Başarılı yanıt gönder (KULLANICIYI GİRİŞ YAPTIRMA!)
      return res.status(201).json({ message: "Registration successful! Please check your email to verify your account." });

    } catch (error) {
      console.error("Registration process error:", error);
      next(error); // Hata yönetimi middleware'ine ilet
    }
  });

  // Kullanıcı Giriş Endpoint'i
  app.post("/api/auth/login", (req, res, next) => {
    // 'local' stratejisini kullanarak kimlik doğrulama yap
    passport.authenticate("local", (err: any, user: Express.User | false | null, info: { message: string } | undefined) => {
      if (err) {
        console.error("Login authentication error:", err);
        return next(err); // Sunucu hatası
      }
      if (!user) {
        // Kimlik doğrulama başarısız
        // E-posta doğrulanmamışsa özel durum
        if (info && info.message === 'EMAIL_NOT_VERIFIED') {
          return res.status(403).json({ message: 'Please verify your email address before logging in.' });
        }
        // Genel giriş hatası
        return res.status(401).json({ message: info?.message || 'Incorrect username or password.' });
      }

      // Kimlik doğrulama başarılı, kullanıcıyı oturuma kaydet
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error("Login session establishment error:", loginErr);
          return next(loginErr);
        }

        // Giriş başarılı, kullanıcı bilgilerini döndür (hassas veriler hariç)
        const userResponse = {
          id: user.id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin,
          fullName: user.fullName,
          address: user.address,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt
        };
        return res.status(200).json({ message: 'Login successful', user: userResponse });
      });
    })(req, res, next); // Middleware'i çağırmayı unutma
  });

  // Kullanıcı Çıkış Endpoint'i
  app.post("/api/auth/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return next(err);
      }
      // Oturumu tamamen yok et (daha güvenli)
      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          // Oturum yok etme hatası olsa bile çıkış başarılı sayılabilir
          console.error("Session destruction error during logout:", destroyErr);
        }
        // Oturum cookie'sini temizle (tarayıcı tarafında)
        res.clearCookie('connect.sid'); // Oturum cookie adı 'connect.sid' ise
        return res.status(200).json({ message: 'Logout successful' });
      });
    });
  });

  // Mevcut Kullanıcı Bilgisini Alma Endpoint'i
  app.get("/api/auth/user", (req, res) => {
    // Kullanıcının kimliği doğrulanmış mı kontrol et
    if (!req.isAuthenticated()) {
      // Doğrulanmamışsa 401 Unauthorized döndür
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Kullanıcı doğrulanmış, req.user deserializeUser tarafından doldurulmuş olmalı
    const user = req.user as SelectUser; // Gerekirse tip dönüşümü yap

    // Hassas verileri (şifre hash'i gibi) ayıklayarak yanıtı hazırla
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      fullName: user.fullName,
      address: user.address,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt
      // Şifre veya token gibi hassas alanları DAHİL ETME
    };
    res.status(200).json(userResponse);
  });

  // Frontend için session kontrolü endpoint'i (mevcut kullanıcı bilgilerini döndürür)
  app.get("/api/auth/me", (req, res) => {
    // Kullanıcının kimliği doğrulanmış mı kontrol et
    if (!req.isAuthenticated()) {
      // Doğrulanmamışsa 401 Unauthorized döndür
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Kullanıcı doğrulanmış, req.user deserializeUser tarafından doldurulmuş olmalı
    const user = req.user as SelectUser;

    // Hassas verileri (şifre hash'i gibi) ayıklayarak yanıtı hazırla
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      fullName: user.fullName,
      address: user.address,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt
    };
    res.status(200).json(userResponse);
  });

  // Başlangıçta Admin Kullanıcısı Oluşturma (Geliştirme için kullanışlı, Prodüksiyon için dikkat!)
  (async () => {
    try {
      // Admin bilgilerini çevre değişkenlerinden al (daha güvenli)
      const adminUsername = process.env.ADMIN_USERNAME ;
      const adminPassword = process.env.ADMIN_PASSWORD ;
      const adminEmail = process.env.ADMIN_EMAIL;

      if (!adminUsername || !adminPassword || !adminEmail) {
        console.error("Admin credentials (username, password, email) must be set in environment variables.");
        // Uygulamanın bu kritik yapılandırma olmadan devam etmesini engellemek için
        // bir hata fırlatabilir veya süreci sonlandırabilirsiniz.
        // Örneğin: throw new Error("Admin credentials not configured.");
        // Bu örnekte, sadece konsola yazdırıp devam ediyoruz, ancak bu ideal değildir.
        return; // Fonksiyondan erken çık
      }

      let admin = await storage.getUserByUsername(adminUsername);
      if (!admin) {
          const hashedPassword = await hashPassword(adminPassword);
          // Admin kullanıcısını oluştur (storage.createUser veya doğrudan db kullan)
          // storage.createUser'un isAdmin ve emailVerified gibi alanları desteklediğinden emin ol
          await db.insert(users).values({
              username: adminUsername,
              password: hashedPassword,
              email: adminEmail,
              fullName: "Admin User",
              isAdmin: true,
              emailVerified: true, // Admin e-postasını doğrulanmış kabul et
              // Şemaya göre diğer gerekli alanları ekle
          }).onConflictDoNothing(); // Zaten varsa hata verme
          console.log(`Admin user '${adminUsername}' created or already exists.`);
      } else {
        console.log(`Admin user '${adminUsername}' already exists.`);
        // Opsiyonel: Şifre çevre değişkeninde değiştiyse güncelle? Dikkatli ol.
      }
    } catch (error) {
        console.error("Error ensuring admin user exists:", error);
    }
  })();


  // E-posta Doğrulama Endpoint'i
  app.get('/verify-email', async (req, res, next) => {
    const { token } = req.query;
    // Frontend URL'sini çevre değişkeninden al, yoksa varsayılan kullan
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    if (!token || typeof token !== 'string') {
      // Token yoksa veya geçersizse frontend'e hata ile yönlendir
      return res.redirect(`${frontendUrl}/email-verified?error=missing_token`);
    }

    try {
      // Token'ı ve geçerlilik süresini kontrol et
      const user = await db.query.users.findFirst({
        where: and(
          eq(users.emailVerificationToken, token),
          // Sürenin dolmadığından emin ol
          gt(users.verificationTokenExpiresAt, new Date())
        )
      });

      if (!user) {
        // Token geçersiz veya süresi dolmuş
        console.log(`Email verification failed: Invalid or expired token (${token})`);
        return res.redirect(`${frontendUrl}/email-verified?error=invalid_or_expired_token`);
      }

      // Kullanıcı bulundu, e-postayı doğrula ve token alanlarını temizle
      await db.update(users)
        .set({
          emailVerified: true,
          emailVerificationToken: null, // Token'ı kullanılamaz hale getir
          verificationTokenExpiresAt: null,
        })
        .where(eq(users.id, user.id));

      console.log(`Email verified successfully for user ID: ${user.id}`);
      // Başarılı doğrulama sayfasına yönlendir
      return res.redirect(`${frontendUrl}/email-verified?success=true`);

    } catch (error) {
      console.error("Email verification process error:", error);
      // Genel bir hata durumunda frontend'e hata ile yönlendir
      return res.redirect(`${frontendUrl}/email-verified?error=verification_failed`);
    }
  });

  // Şifre sıfırlama isteği gönderme
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      const user = await storage.getUserByEmail(email);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Şifre sıfırlama token'ı oluştur
      const resetToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 saat

      // Token'ı veritabanına kaydet
      await db.insert(passwordResets).values({
        token: resetToken,
        userId: user.id,
        expiresAt: tokenExpiry,
        createdAt: new Date(),
      });

      // Şifre sıfırlama linkini oluştur
      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

      // Email gönder
      await sendEmail({
        to: user.email,
        subject: "Password Reset Request",
        text: `Click the link below to reset your password: ${resetLink}`,
        html: `
          <h1>Password Reset Request</h1>
          <p>Click the link below to reset your password:</p>
          <a href="${resetLink}">${resetLink}</a>
          <p>This link will expire in 1 hour.</p>
        `,
      });

      res.json({ message: "Password reset email sent" });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Failed to process password reset request" });
    }
  });

  // Şifre sıfırlama token'ını doğrula
  app.post("/api/auth/verify-reset-token", async (req, res) => {
    try {
      const { token } = req.body;

      const resetRequest = await db.query.passwordResets.findFirst({
        where: eq(passwordResets.token, token),
      });

      if (!resetRequest) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      if (resetRequest.expiresAt < new Date()) {
        await db.delete(passwordResets).where(eq(passwordResets.token, token));
        return res.status(400).json({ message: "Token has expired" });
      }

      res.json({ message: "Token is valid", userId: resetRequest.userId });
    } catch (error) {
      console.error("Token verification error:", error);
      res.status(500).json({ message: "Failed to verify token" });
    }
  });

  // Yeni şifre belirleme
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;

      const resetRequest = await db.query.passwordResets.findFirst({
        where: eq(passwordResets.token, token),
      });

      if (!resetRequest) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      if (resetRequest.expiresAt < new Date()) {
        await db.delete(passwordResets).where(eq(passwordResets.token, token));
        return res.status(400).json({ message: "Token has expired" });
      }

      // Yeni şifreyi hashle
      const hashedPassword = await hashPassword(password);

      // Kullanıcının şifresini güncelle
      await db.update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, resetRequest.userId));

      res.json({ message: "Password has been reset successfully" });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });
}