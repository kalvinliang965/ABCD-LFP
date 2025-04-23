import '@testing-library/jest-dom';

// avoid type conflicts with DOM expectations in React/testing-library
(global as any).TextEncoder = require('util').TextEncoder;
(global as any).TextDecoder = require('util').TextDecoder;
