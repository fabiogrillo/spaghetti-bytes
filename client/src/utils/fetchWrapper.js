// client/src/utils/fetchWrapper.js

/**
 * Wrapper for fetch API with proper error handling and base URL configuration
 */

const getApiBaseUrl = () => {
    // In production, use relative path
    if (process.env.NODE_ENV === 'production') {
        return '';
    }
    // In development, use proxy or direct URL
    return process.env.REACT_APP_API_URL || 'http://localhost:5000';
};

/**
 * Enhanced fetch wrapper with error handling
 * @param {string} url - The endpoint URL (e.g., '/api/goals')
 * @param {object} options - Fetch options
 * @returns {Promise} - Response data
 */
export const fetchWrapper = async (url, options = {}) => {
    const baseUrl = getApiBaseUrl();
    const fullUrl = `${baseUrl}${url}`;

    console.log('Fetching:', fullUrl);

    const defaultOptions = {
        credentials: 'include', // Important for cookies
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    try {
        const response = await fetch(fullUrl, defaultOptions);

        // Log response details for debugging
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        // Try to parse as JSON first
        const contentType = response.headers.get('content-type');
        let data;

        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            // If not JSON, get text (might be HTML error page)
            const text = await response.text();
            console.error('Non-JSON response:', text);

            // Check if it's an HTML error page
            if (text.includes('<!DOCTYPE') || text.includes('<html')) {
                throw new Error('Server returned HTML instead of JSON. This usually means the API endpoint is not found or there is a server configuration issue.');
            }

            // Try to parse as JSON anyway in case content-type is wrong
            try {
                data = JSON.parse(text);
            } catch (e) {
                throw new Error(`Server returned non-JSON response: ${text.substring(0, 200)}`);
            }
        }

        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('Fetch error:', error);

        // Enhance error message
        if (error.message === 'Failed to fetch') {
            error.message = 'Network error - could not connect to server. Please check if the server is running.';
        }

        throw error;
    }
};

/**
 * Convenience methods for common HTTP methods
 */
export const api = {
    get: (url) => fetchWrapper(url),

    post: (url, data) => fetchWrapper(url, {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    put: (url, data) => fetchWrapper(url, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),

    delete: (url) => fetchWrapper(url, {
        method: 'DELETE',
    }),
};

export default fetchWrapper;