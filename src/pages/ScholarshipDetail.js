import React from 'react';
import PropTypes from 'prop-types';

const ScholarshipDetail = ({ scholarship }) => {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-xl mt-10">
      <div className="border-b pb-4 mb-6">
        <h1 className="text-3xl font-bold text-indigo-700">{scholarship.name}</h1>
        <p className="text-gray-500">Provided by ID: {scholarship.provider_id}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p className="text-gray-700">{scholarship.description}</p>

          <h2 className="text-xl font-semibold mt-6 mb-2">Eligibility Criteria</h2>
          <p className="bg-gray-50 p-4 border-l-4 border-indigo-500 italic text-gray-700">
            {scholarship.eligibility}
          </p>
        </div>

        <div className="bg-indigo-50 p-6 rounded-lg">
          <p className="text-sm text-gray-600 uppercase font-bold">Deadline</p>
          <p className="text-2xl text-red-600 mb-4">
            {new Date(scholarship.deadline).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>

          <button
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-800 transition"
            aria-label={`Apply for ${scholarship.name}`}
          >
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );
};

ScholarshipDetail.propTypes = {
  scholarship: PropTypes.shape({
    name: PropTypes.string.isRequired,
    provider_id: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    eligibility: PropTypes.string.isRequired,
    deadline: PropTypes.string.isRequired,
  }).isRequired,
};

export default ScholarshipDetail;
