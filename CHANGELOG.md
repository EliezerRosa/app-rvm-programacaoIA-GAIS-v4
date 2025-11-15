# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.0.0] - 2025-11-15

### Added
- Initial release of RVM Programming AI GAIS v4
- Flask web application with RESTful API
- AI-powered schedule generation using OpenAI GPT
- Mock schedule generator for environments without AI
- Responsive web interface with modern gradient design
- Health check API endpoint
- Schedule generation API endpoint
- Comprehensive test suite with 6 unit tests
- Complete documentation (README.md, DEPLOYMENT.md)
- Environment-based configuration
- Logging system for error tracking
- Security: Configurable debug mode via environment variable

### Features
- Automatic assignment distribution among participants
- Song suggestions for meetings
- Support for Portuguese language
- Clean and intuitive user interface
- Mobile-responsive design

### Security
- Flask debug mode controlled by environment variable
- Environment variable support for sensitive data
- Proper error handling and logging
- Security guidelines in deployment documentation

### Technical Details
- Python 3.8+ support
- Flask 3.0.0
- OpenAI API integration (optional)
- HTML5, CSS3, JavaScript frontend
- Test coverage for core functionality
