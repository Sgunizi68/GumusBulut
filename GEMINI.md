
## General Principles
- Write clean, readable, and maintainable code
- Follow DRY (Don't Repeat Yourself) principles
- Use meaningful variable and function names
- Keep functions small and focused on a single responsibility
- Write self-documenting code with clear intent
- Prioritize code readability over cleverness
- Use consistent formatting and indentation
- Handle errors gracefully and provide meaningful error messages

## Code Structure & Organization
- Organize code into logical modules and directories
- Use consistent file naming conventions (kebab-case for files, PascalCase for classes)
- Group related functionality together
- Separate concerns (business logic, UI, data access)
- Keep configuration separate from code
- Use dependency injection where appropriate

## Documentation & Comments
- Write clear, concise comments that explain WHY, not WHAT
- Use JSDoc/docstrings for function documentation
- Keep README files up to date
- Document complex algorithms and business logic
- Avoid obvious comments that restate the code
- Use TODO comments sparingly and track them properly

## Testing Best Practices
- Write unit tests for all business logic
- Use descriptive test names that explain the scenario
- Follow AAA pattern: Arrange, Act, Assert
- Mock external dependencies
- Aim for high test coverage but focus on critical paths
- Write integration tests for important workflows
- Keep tests simple and focused

## Performance Considerations
- Optimize for readability first, performance second
- Profile before optimizing
- Use appropriate data structures and algorithms
- Avoid premature optimization
- Cache expensive computations when appropriate
- Minimize database queries and API calls
- Use lazy loading for large datasets

## Security Guidelines
- Validate all inputs and sanitize outputs
- Use parameterized queries to prevent SQL injection
- Implement proper authentication and authorization
- Store secrets in environment variables, never in code
- Use HTTPS for all communications
- Follow principle of least privilege
- Keep dependencies updated and audit for vulnerabilities

## Language-Specific Rules

### JavaScript/TypeScript
- Use TypeScript for type safety
- Prefer const over let, avoid var
- Use arrow functions for short functions
- Destructure objects and arrays when appropriate
- Use async/await over promises when possible
- Implement proper error handling with try/catch
- Use strict mode
- Prefer template literals over string concatenation

### Python
- Follow PEP 8 style guidelines
- Use type hints for function parameters and return values
- Prefer list comprehensions over loops when readable
- Use context managers (with statements) for resource management
- Handle exceptions specifically, avoid bare except clauses
- Use virtual environments for dependency management
- Write docstrings for all public functions and classes

### React/Frontend
- Use functional components with hooks
- Implement proper state management (useState, useReducer, or external state)
- Memoize expensive calculations with useMemo/useCallback
- Use proper key props for list items
- Implement proper loading and error states
- Follow component composition patterns
- Use semantic HTML elements
- Ensure accessibility with proper ARIA attributes

### Backend/API Development
- Use RESTful API design principles
- Implement proper HTTP status codes
- Use middleware for cross-cutting concerns
- Implement rate limiting and request validation
- Use database transactions where appropriate
- Log errors and important events
- Implement health checks and monitoring

## Git & Version Control
- Write clear, descriptive commit messages
- Use conventional commit format when possible
- Keep commits small and focused
- Use feature branches for development
- Squash commits before merging to main
- Tag releases appropriately
- Include relevant issue numbers in commits

## Code Review Guidelines
- Review for logic, not just syntax
- Check for security vulnerabilities
- Ensure tests are included and passing
- Verify documentation is updated
- Look for potential performance issues
- Suggest improvements constructively
- Approve only when confident in the changes

## Environment & Configuration
- Use environment variables for configuration
- Have separate configs for dev, staging, and production
- Never commit secrets or sensitive data
- Use .env files for local development
- Document all required environment variables
- Use configuration validation on startup

## Error Handling
- Implement comprehensive error handling
- Use specific exception types
- Log errors with sufficient context
- Provide user-friendly error messages
- Implement retry logic for transient failures
- Use circuit breakers for external service calls
- Monitor error rates and investigate spikes

## Dependencies & Libraries
- Keep dependencies minimal and justified
- Regularly update dependencies
- Audit for security vulnerabilities
- Prefer well-maintained, popular libraries
- Document why specific libraries were chosen
- Use lock files to ensure consistent installations
- Remove unused dependencies

## Monitoring & Observability
- Implement proper logging at appropriate levels
- Use structured logging (JSON format)
- Add metrics for key business operations
- Implement health checks
- Use distributed tracing for microservices
- Monitor performance and resource usage
- Set up alerts for critical issues

## Code Quality Tools
- Use linters (ESLint, Pylint, etc.)
- Implement automated formatting (Prettier, Black)
- Use static analysis tools
- Run security scans
- Maintain consistent code style across the team
- Set up pre-commit hooks
- Use CI/CD for automated checks