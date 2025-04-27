import { Link } from "wouter";
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Github, 
  Youtube 
} from "lucide-react";
import { FormattedMessage } from "react-intl";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
        <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
          <div className="px-5 py-2">
            <Link href="#" className="text-base text-gray-500 hover:text-gray-900">
              <FormattedMessage id="footer.about" />
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link href="#" className="text-base text-gray-500 hover:text-gray-900">
              <FormattedMessage id="footer.blog" />
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link href="#" className="text-base text-gray-500 hover:text-gray-900">
              <FormattedMessage id="footer.jobs" />
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link href="#" className="text-base text-gray-500 hover:text-gray-900">
              <FormattedMessage id="footer.press" />
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link href="#" className="text-base text-gray-500 hover:text-gray-900">
              <FormattedMessage id="footer.accessibility" />
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link href="#" className="text-base text-gray-500 hover:text-gray-900">
              <FormattedMessage id="footer.partners" />
            </Link>
          </div>
        </nav>
        <div className="mt-8 flex justify-center space-x-6">
          <a href="#" className="text-gray-400 hover:text-gray-500">
            <span className="sr-only"><FormattedMessage id="footer.facebook" /></span>
            <Facebook className="h-6 w-6" />
          </a>
          <a href="#" className="text-gray-400 hover:text-gray-500">
            <span className="sr-only"><FormattedMessage id="footer.instagram" /></span>
            <Instagram className="h-6 w-6" />
          </a>
          <a href="#" className="text-gray-400 hover:text-gray-500">
            <span className="sr-only"><FormattedMessage id="footer.twitter" /></span>
            <Twitter className="h-6 w-6" />
          </a>
          <a href="#" className="text-gray-400 hover:text-gray-500">
            <span className="sr-only"><FormattedMessage id="footer.github" /></span>
            <Github className="h-6 w-6" />
          </a>
          <a href="#" className="text-gray-400 hover:text-gray-500">
            <span className="sr-only"><FormattedMessage id="footer.youtube" /></span>
            <Youtube className="h-6 w-6" />
          </a>
        </div>
        <p className="mt-8 text-center text-base text-gray-400">
          <FormattedMessage id="footer.copyright" />
        </p>
      </div>
    </footer>
  );
}
