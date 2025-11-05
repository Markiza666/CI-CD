import React, { useState } from 'react';
import { MeetupFilter } from '../interfaces';
import { useAuth } from '../context/authContext';

interface MeetupFilterFormProps {
    // A callback function to pass the filter state up to the parent component (MeetupList)
    onFilterChange: (filters: MeetupFilter) => void;
    currentFilters: MeetupFilter;
}

// Component for capturing user input for filtering meetups (US 4)
const MeetupFilterForm: React.FC<MeetupFilterFormProps> = ({ onFilterChange, currentFilters }) => {
    // We use internal state for form inputs, driven by the currentFilters prop
    const [filters, setFilters] = useState<MeetupFilter>(currentFilters);
    const { isAuthenticated } = useAuth(); // Needed to show 'Attending' filter

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    // Destructure only the universal properties (name, value, type). 
    // We omit 'checked' as it doesn't exist on HTMLSelectElement.
    const { name, value, type } = e.target;
    
    // Determine the correct value: 
    // If it's a checkbox, use the 'checked' property (requires casting e.target to HTMLInputElement).
    // Otherwise, use 'value'.
    const processedValue = type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : value;

    setFilters(prev => ({
        ...prev,
        [name]: processedValue, // Use the processed boolean (for checkbox) or string (for text/select)
    }));
};
    
    // When the form is submitted (e.g., search button clicked or user presses Enter)
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Send the complete filter object back to the MeetupList
        onFilterChange(filters);
    };

    return (
        <form onSubmit={handleSubmit} className="filter-form p-4 bg-gray-100 rounded shadow-md mb-6">
            <div className="flex flex-wrap gap-4 items-end">
                
                {/* Search Query Input (US 4.1) */}
                <div className="form-group flex-1 min-w-[200px]">
                    <label htmlFor="searchQuery" className="block text-sm font-medium text-gray-700">Search Meetups (Title/Description)</label>
                    <input 
                        type="text" 
                        id="searchQuery"
                        name="searchQuery"
                        value={filters.searchQuery}
                        onChange={handleChange}
                        placeholder="e.g., 'Coding' or 'Coffee'"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                </div>

                {/* City Filter (US 4.2) - Simple text input for now */}
                <div className="form-group min-w-[150px]">
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                    <input 
                        type="text"
                        id="city"
                        name="city"
                        value={filters.city || ''}
                        onChange={handleChange}
                        placeholder="e.g., Stockholm"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                </div>
                
                {/* Attending Filter (US 4.3) - Only visible if logged in */}
                {isAuthenticated && (
                    <div className="form-group flex items-center pt-2">
                        <input 
                            type="checkbox"
                            id="isAttending"
                            name="isAttending"
                            checked={filters.isAttending || false}
                            onChange={handleChange}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor="isAttending" className="ml-2 block text-sm font-medium text-gray-700">
                            Only show meetups I'm attending
                        </label>
                    </div>
                )}
                
                {/* Submit Button */}
                <button 
                    type="submit" 
                    className="submit-button bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-150"
                >
                    Apply Filters
                </button>
            </div>
        </form>
    );
};

export default MeetupFilterForm;
