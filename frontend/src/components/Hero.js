import React from 'react';

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-b from-blue-50 to-indigo-50 py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl mb-6">
            Gas Usage Prediction System using Mathematical Analysis
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Upload your gas usage datasets and get accurate predictions powered by advanced mathematical models.
          </p>
          <div className="flex flex-col sm:flex-row sm:space-x-4 justify-center">
            <Link to="/upload" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-transform duration-200 hover:scale-105 shadow-lg">
              Upload Dataset
            </Link>
            <Link to="/demo" className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition-transform duration-200 hover:scale-105">
              View Demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;