import React from 'react';
import Header from '@/components/layout/header'; // Assuming existing header can be used

// Placeholder Section Components

const HeroSection = () => (
  <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-center">
    <div className="container mx-auto px-4">
      <h1 className="text-5xl font-bold mb-6">Welcome to LearnHub</h1>
      <p className="text-xl mb-8">Your journey to knowledge and skill mastery starts here. Explore thousands of courses.</p>
      <button className="bg-yellow-400 text-gray-900 font-semibold px-8 py-3 rounded-lg hover:bg-yellow-300 transition duration-300">
        Get Started
      </button>
    </div>
  </section>
);

const ValuePropositionSection = () => (
  <section className="py-16 bg-white">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Why Choose LearnHub?</h2>
      <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
        We offer a unique learning experience designed for your success.
      </p>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="p-6 shadow-lg rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Expert Instructors</h3>
          <p className="text-gray-600">Learn from industry professionals and experienced educators.</p>
        </div>
        <div className="p-6 shadow-lg rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Flexible Learning</h3>
          <p className="text-gray-600">Study at your own pace, anytime, anywhere.</p>
        </div>
        <div className="p-6 shadow-lg rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Diverse Catalog</h3>
          <p className="text-gray-600">Explore a wide range of courses across various disciplines.</p>
        </div>
      </div>
    </div>
  </section>
);

const CourseCategoriesSection = () => (
  <section className="py-16 bg-gray-100">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl font-bold text-gray-800 mb-12">Explore Our Categories</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {['Technology', 'Business', 'Creative Arts', 'Health & Wellness', 'Languages', 'Science'].map(category => (
          <div key={category} className="p-6 bg-white rounded-lg shadow hover:shadow-xl transition-shadow cursor-pointer">
            <p className="text-lg font-semibold text-gray-700">{category}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const FeaturedCoursesSection = () => (
  <section className="py-16 bg-white">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl font-bold text-gray-800 mb-12">Featured Courses</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {/* Placeholder Course Cards */}
        {[1, 2, 3].map(i => (
          <div key={i} className="border rounded-lg shadow-lg p-6">
            <div className="h-40 bg-gray-300 rounded-md mb-4 animate-pulse"></div> {/* Image Placeholder */}
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Featured Course {i}</h3>
            <p className="text-gray-600 mb-4">A brief description of this amazing course.</p>
            <button className="w-full px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300">
              Learn More
            </button>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const HowItWorksSection = () => (
  <section className="py-16 bg-gray-100">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl font-bold text-gray-800 mb-12">How LearnHub Works</h2>
      <div className="grid md:grid-cols-3 gap-12">
        <div className="flex flex-col items-center">
          <div className="bg-blue-500 text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold mb-4">1</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Sign Up</h3>
          <p className="text-gray-600">Create your free account in minutes.</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="bg-blue-500 text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold mb-4">2</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Choose a Course</h3>
          <p className="text-gray-600">Browse our catalog and enroll.</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="bg-blue-500 text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold mb-4">3</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Start Learning</h3>
          <p className="text-gray-600">Access materials and begin your journey.</p>
        </div>
      </div>
    </div>
  </section>
);

const TestimonialsSection = () => (
  <section className="py-16 bg-white">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl font-bold text-gray-800 mb-12">What Our Students Say</h2>
      <div className="grid md:grid-cols-2 gap-8">
        {[1, 2].map(i => (
          <div key={i} className="bg-gray-50 p-8 rounded-lg shadow-lg">
            <p className="text-gray-600 italic mb-6">"This platform has transformed my career! The courses are top-notch and the instructors are amazing."</p>
            <p className="font-semibold text-gray-800">- Student {i}</p>
            <p className="text-sm text-gray-500">Web Developer</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const BecomeAnInstructorSection = () => (
  <section className="py-16 bg-blue-50">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Become an Instructor</h2>
      <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">Share your expertise with the world and earn by teaching on LearnHub.</p>
      <button className="px-8 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition duration-300">
        Teach on LearnHub
      </button>
    </div>
  </section>
);

const FinalCTASection = () => (
  <section className="py-20 bg-indigo-700 text-white text-center">
    <div className="container mx-auto px-4">
      <h2 className="text-4xl font-bold mb-6">Ready to Start Learning?</h2>
      <p className="text-xl mb-8">Join thousands of learners and achieve your goals with LearnHub.</p>
      <button className="bg-yellow-400 text-gray-900 font-semibold px-10 py-4 rounded-lg text-lg hover:bg-yellow-300 transition duration-300">
        Sign Up For Free
      </button>
    </div>
  </section>
);

const Footer = () => (
  <footer className="py-12 bg-gray-800 text-gray-300 text-center">
    <div className="container mx-auto px-4">
      <p>&copy; {new Date().getFullYear()} LearnHub. All rights reserved.</p>
      <div className="mt-4 space-x-4">
        <a href="#" className="hover:text-white">Privacy Policy</a>
        <a href="#" className="hover:text-white">Terms of Service</a>
        <a href="#" className="hover:text-white">Contact Us</a>
      </div>
    </div>
  </footer>
);

const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header /> {/* Assuming existing header is suitable or will be adapted */}
      <main className="flex-grow">
        <HeroSection />
        <ValuePropositionSection />
        <CourseCategoriesSection />
        <FeaturedCoursesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <BecomeAnInstructorSection />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
