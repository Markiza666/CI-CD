import React, { useState } from 'react';
import { MeetupFilter } from '../../interfaces';
import { useAuth } from '../../context/authContext';
import styles from '../meetupFilterForm/meetupFilterForm.module.scss';

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
        <form onSubmit={handleSubmit} className={styles.filterForm}> 
            <div className={styles.filterControls}>
                
                {/* Search Query Input (US 4.1) */}
                <div className={styles.formGroupInput}>
                    <label htmlFor="searchQuery" className={styles.formLabel}>Search Meetups (Title/Description)</label>
                    <input 
                        type="text" 
                        id="searchQuery"
                        name="searchQuery"
                        value={filters.searchQuery}
                        onChange={handleChange}
                        placeholder="e.g., 'Coding' or 'Coffee'"
                        className={styles.inputFieldStandard}
                    />
                </div>

                {/* City Filter (US 4.2) - Simple text input for now */}
                <div className={`${styles.formGroupInput} ${styles.formGroupCity}`}>
                    <label htmlFor="location" className={styles.formLabel}>Location</label>
                    <input 
                        type="text"
                        id="location"
                        name="location"
                        value={filters.location || ''}
                        onChange={handleChange}
                        placeholder="e.g., Stockholm"
                        className={styles.inputFieldStandard}
                    />
                </div>
                
                {/* Attending Filter (US 4.3) - Only visible if logged in */}
                {isAuthenticated && (
                    <div className={styles.checkboxGroup}>
                        <input 
                            type="checkbox"
                            id="isAttending"
                            name="isAttending"
                            checked={filters.isAttending || false}
                            onChange={handleChange}
                            className={styles.checkboxInput}
                        />
                        <label htmlFor="isAttending"className={styles.checkboxLabel}>
                            Only show meetups I'm attending
                        </label>
                    </div>
                )}
                
                {/* Submit Button */}
                <button 
                    type="submit" 
                    className={styles.submitButtonPrimary}
                >
                    Apply Filters
                </button>
            </div>
        </form>
    );
};

export default MeetupFilterForm;
