import { Link } from "react-router-dom";
import { Github, Twitter, Mail, Heart, BookOpen } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-base-200 border-t border-base-300 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-content" />
              </div>
              <span className="text-xl font-bold">Blog Platform</span>
            </div>
            <p className="text-base-content/70 mb-4 max-w-md">
              A modern blogging platform where writers share their stories, insights, and expertise with the world. Join our community of passionate writers and readers.
            </p>
            <div className="flex gap-4">
              <a href="#" className="btn btn-ghost btn-sm btn-circle">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="btn btn-ghost btn-sm btn-circle">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="btn btn-ghost btn-sm btn-circle">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-base-content/70 hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/posts" className="text-base-content/70 hover:text-primary transition-colors">
                  All Posts
                </Link>
              </li>
              <li>
                <Link to="/create" className="text-base-content/70 hover:text-primary transition-colors">
                  Write Post
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-base-content/70 hover:text-primary transition-colors">
                  Search
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4">Popular Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/category/technology" className="text-base-content/70 hover:text-primary transition-colors">
                  Technology
                </Link>
              </li>
              <li>
                <Link to="/category/lifestyle" className="text-base-content/70 hover:text-primary transition-colors">
                  Lifestyle
                </Link>
              </li>
              <li>
                <Link to="/category/business" className="text-base-content/70 hover:text-primary transition-colors">
                  Business
                </Link>
              </li>
              <li>
                <Link to="/category/health" className="text-base-content/70 hover:text-primary transition-colors">
                  Health
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-base-300 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-base-content/60 text-sm">
            © {currentYear} Blog Platform. All rights reserved.
          </div>
          <div className="flex items-center gap-1 text-base-content/60 text-sm">
            Made with <Heart className="w-4 h-4 text-error fill-current" /> by developers
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
