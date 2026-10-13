import React from "react";

const Footer = () => {
  return (
    <footer className="bg-black text-gray-300 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4">

        {/* Why MakeMyTour Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div>
            <h3 className="text-xl font-bold mb-4">
              Why MakeMyTour?
            </h3>
            <p className="text-sm leading-relaxed">
              Established in 2000, MakeMyTour has positioned itself
              as a travel booking platform offering competitive
              fares, exclusive discounts, and a convenient online
              booking experience.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">
              Booking Flights with MakeMyTour
            </h3>
            <p className="text-sm leading-relaxed">
              Book flight tickets and explore travel options with
              MakeMyTour. Find convenient options for flights,
              hotels, and holiday trips.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">
              Domestic Flights with MakeMyTour
            </h3>
            <p className="text-sm leading-relaxed">
              Explore domestic travel options with convenient
              booking and competitive fares.
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">

          <div>
            <h4 className="font-semibold mb-3">ABOUT THE SITE</h4>
            <ul className="text-sm space-y-2">
              <li>
                <a href="#" className="hover:text-white transition">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Investor Relations
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Careers
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">POPULAR HOTELS</h4>
            <ul className="text-sm space-y-2">
              <li>
                <a href="#" className="hover:text-white transition">
                  Hotels in Delhi
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Hotels in Mumbai
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Hotels in Goa
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">QUICK LINKS</h4>
            <ul className="text-sm space-y-2">
              <li>
                <a href="#" className="hover:text-white transition">
                  COVID-19 Update
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Flight Schedule
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Train Schedule
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">IMPORTANT LINKS</h4>
            <ul className="text-sm space-y-2">
              <li>
                <a href="#" className="hover:text-white transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  User Agreement
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Social Media & Copyright */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">

            {/* Social Media Links */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <span className="text-sm font-semibold mr-2">
                Follow us:
              </span>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                title="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-600 text-lg font-bold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition"
              >
                f
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                title="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-600 text-2xl hover:bg-pink-600 hover:text-white hover:border-pink-600 transition"
              >
                ◎
              </a>

              {/* X / Twitter */}
              <a
                href="https://x.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
                title="X"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-600 text-lg font-bold hover:bg-gray-700 hover:text-white hover:border-gray-700 transition"
              >
                𝕏
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                title="LinkedIn"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-600 text-sm font-bold hover:bg-blue-700 hover:text-white hover:border-blue-700 transition"
              >
                in
              </a>

              {/* YouTube */}
              <a
                href="https://www.youtube.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                title="YouTube"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-600 text-lg hover:bg-red-600 hover:text-white hover:border-red-600 transition"
              >
                ▶
              </a>
            </div>

            {/* Copyright */}
            <p className="text-sm text-center">
              © 2026 MakeMyTour PVT. LTD. All rights reserved.
            </p>

          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
