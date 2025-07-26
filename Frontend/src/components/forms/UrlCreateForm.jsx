import React, { useState } from 'react';
import { Link2, Calendar, Hash, FileText } from 'lucide-react';
import { urlService } from '../../services/urlService';
import { SUCCESS_MESSAGES } from '../../utils/constants';
import { urlUtils, errorUtils } from '../../utils/helpers';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import toast from 'react-hot-toast';

const UrlCreateForm = ({ onUrlCreated }) => {
  const [formData, setFormData] = useState({
    originalUrl: '',
    customCode: '',
    title: '',
    description: '',
    expirationDate: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // URL validation
    if (!formData.originalUrl.trim()) {
      errors.originalUrl = 'URL is required';
    } else {
      const urlWithProtocol = urlUtils.addProtocol(formData.originalUrl);
      if (!urlUtils.isValidUrl(urlWithProtocol)) {
        errors.originalUrl = 'Please enter a valid URL';
      }
    }

    // Custom code validation (optional)
    if (formData.customCode && formData.customCode.length < 3) {
      errors.customCode = 'Custom code must be at least 3 characters';
    }

    // Expiration date validation (optional)
    if (formData.expirationDate) {
      const expirationDate = new Date(formData.expirationDate);
      const now = new Date();
      if (expirationDate <= now) {
        errors.expirationDate = 'Expiration date must be in the future';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare submission data
      const submissionData = {
        originalUrl: urlUtils.addProtocol(formData.originalUrl),
      };

      // Add optional fields if provided
      if (formData.customCode) {
        submissionData.customCode = formData.customCode;
      }
      if (formData.title) {
        submissionData.title = formData.title;
      }
      if (formData.description) {
        submissionData.description = formData.description;
      }
      if (formData.expirationDate) {
        submissionData.expirationDate = new Date(formData.expirationDate).toISOString();
      }

      const response = await urlService.createUrl(submissionData);
      
      if (response.success) {
        toast.success(SUCCESS_MESSAGES.URL_CREATED);
        
        // Reset form
        setFormData({
          originalUrl: '',
          customCode: '',
          title: '',
          description: '',
          expirationDate: '',
        });
        setShowAdvanced(false);
        
        // Notify parent component
        if (onUrlCreated) {
          onUrlCreated(response.data);
        }
      }
    } catch (err) {
      const validationErrors = errorUtils.getValidationErrors(err);
      if (Object.keys(validationErrors).length > 0) {
        setFormErrors(validationErrors);
      } else {
        toast.error(err.message || 'Failed to create short URL');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAdvanced = () => {
    setShowAdvanced(!showAdvanced);
  };

  return (
    <Card>
      <Card.Header>
        <Card.Title className="flex items-center space-x-2">
          <Link2 className="w-5 h-5 text-blue-600" />
          <span>Create Short URL</span>
        </Card.Title>
      </Card.Header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Original URL */}
        <Input
          label="Original URL"
          name="originalUrl"
          type="url"
          value={formData.originalUrl}
          onChange={handleInputChange}
          error={formErrors.originalUrl}
          placeholder="https://www.example.com/very/long/url"
          required
          helperText="Enter the URL you want to shorten"
        />

        {/* Advanced Options Toggle */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={toggleAdvanced}
            className="text-sm text-blue-600 hover:text-blue-500 focus:outline-none"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Options
          </button>
        </div>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            {/* Custom Code */}
            <div className="relative">
              <Input
                label="Custom Short Code (Optional)"
                name="customCode"
                type="text"
                value={formData.customCode}
                onChange={handleInputChange}
                error={formErrors.customCode}
                placeholder="my-custom-code"
                helperText="Leave empty for auto-generated code"
              />
              <Hash className="absolute right-3 top-8 w-4 h-4 text-gray-400" />
            </div>

            {/* Title */}
            <Input
              label="Title (Optional)"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleInputChange}
              error={formErrors.title}
              placeholder="My Website"
              helperText="A descriptive title for your URL"
            />

            {/* Description */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description of the URL content"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <FileText className="absolute right-3 top-8 w-4 h-4 text-gray-400" />
              {formErrors.description && (
                <p className="text-sm text-red-600 mt-1">{formErrors.description}</p>
              )}
            </div>

            {/* Expiration Date */}
            <div className="relative">
              <Input
                label="Expiration Date (Optional)"
                name="expirationDate"
                type="datetime-local"
                value={formData.expirationDate}
                onChange={handleInputChange}
                error={formErrors.expirationDate}
                helperText="URL will expire after this date"
              />
              <Calendar className="absolute right-3 top-8 w-4 h-4 text-gray-400" />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create Short URL'}
        </Button>
      </form>
    </Card>
  );
};

export default UrlCreateForm;