// Mock API service for development/testing
// This simulates backend API responses for login and register

// Mock users database (in real app, this would be in backend)
const mockUsers = [
    {
        id: 1,
        email: "admin@example.com",
        password: "admin123",
        username: "admin",
        role: "admin",
        phone: "0123456789"
    },
    {
        id: 2,
        email: "user@example.com",
        password: "user123",
        username: "user",
        role: "user",
        phone: "0987654321"
    }
];

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API responses
export const mockApi = {
    // Mock login
    async login(credentials) {
        await delay(800); // Simulate network delay

        const { username, password } = credentials;

        // Find user by email and password
        const user = mockUsers.find(u => u.username === username && u.password === password);

        if (!user) {
            return Promise.reject({
                response: {
                    status: 401,
                    data: {
                        message: "username hoặc mật khẩu không đúng"
                    }
                }
            });
        }

        // Generate mock token
        const token = `mock_token_${user.id}_${Date.now()}`;

        // Return user data without password
        const { password: _, ...userWithoutPassword } = user;

        return {
            data: {
                success: true,
                message: "Đăng nhập thành công",
                token,
                user: userWithoutPassword,
                refreshToken: `mock_refresh_${user.id}_${Date.now()}`
            }
        };
    },

    // Mock register
    async register(userData) {
        await delay(1000); // Simulate network delay

        const { email, password, name, phone } = userData;

        // Check if email already exists
        const existingUser = mockUsers.find(u => u.email === email);
        if (existingUser) {
            return Promise.reject({
                response: {
                    status: 400,
                    data: {
                        message: "Email đã được sử dụng"
                    }
                }
            });
        }

        // Create new user
        const newUser = {
            id: mockUsers.length + 1,
            email,
            password, // In real app, this would be hashed
            name,
            phone,
            role: "user" // Default role
        };

        // Add to mock database
        mockUsers.push(newUser);

        // Generate mock token
        const token = `mock_token_${newUser.id}_${Date.now()}`;

        // Return user data without password
        const { password: _, ...userWithoutPassword } = newUser;

        return {
            data: {
                success: true,
                message: "Đăng ký thành công",
                token,
                user: userWithoutPassword,
                refreshToken: `mock_refresh_${newUser.id}_${Date.now()}`
            }
        };
    },

    // Mock refresh token
    async refreshToken(refreshTokenData) {
        await delay(500);

        const { refreshToken } = refreshTokenData;

        // Extract user ID from mock refresh token
        const userId = refreshToken.split('_')[2];
        const user = mockUsers.find(u => u.id == userId);

        if (!user) {
            return Promise.reject({
                response: {
                    status: 401,
                    data: {
                        message: "Refresh token không hợp lệ"
                    }
                }
            });
        }

        // Generate new tokens
        const newToken = `mock_token_${user.id}_${Date.now()}`;
        const newRefreshToken = `mock_refresh_${user.id}_${Date.now()}`;

        const { password: _, ...userWithoutPassword } = user;

        return {
            data: {
                success: true,
                token: newToken,
                refreshToken: newRefreshToken,
                user: userWithoutPassword
            }
        };
    },

    // Mock logout
    async logout() {
        await delay(300);

        return {
            data: {
                success: true,
                message: "Đăng xuất thành công"
            }
        };
    },

    // Mock get profile
    async getProfile() {
        await delay(400);

        const token = localStorage.getItem("authToken");
        if (!token) {
            return Promise.reject({
                response: {
                    status: 401,
                    data: {
                        message: "Token không hợp lệ"
                    }
                }
            });
        }

        // Extract user ID from token
        const userId = token.split('_')[2];
        const user = mockUsers.find(u => u.id == userId);

        if (!user) {
            return Promise.reject({
                response: {
                    status: 401,
                    data: {
                        message: "Người dùng không tồn tại"
                    }
                }
            });
        }

        const { password: _, ...userWithoutPassword } = user;

        return {
            data: {
                success: true,
                user: userWithoutPassword
            }
        };
    }
};

// Export mock users for testing
export const getMockUsers = () => mockUsers.map(({ password, ...user }) => user);
