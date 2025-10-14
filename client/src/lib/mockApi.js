const mockUsers = [
    {
        account_id: "babc8bf4-222a-4c79-b5d2-a847b6a94296",
        username: "admin",
        email: "admin@example.com",
        password: "admin1234",
        fullname: "Quản trị viên",
        phone_number: "0123456789",
        permission: "admin",
        status: "active"
    },
    {
        account_id: "c9cd9cf5-333b-5d8a-c6e3-b958c7b95397",
        username: "tynguyen",
        email: "user@example.com",
        password: "user1234",
        fullname: "Nguyễn Văn A",
        phone_number: "0987654321",
        permission: "driver",
        status: "active"
    }
];

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API responses
export const mockApi = {
    // Mock login
    async login(credentials) {
        await delay(800); // Simulate network delay

        const { email, password } = credentials;

        // Find user by email and password
        const user = mockUsers.find(u => u.email === email && u.password === password);

        if (!user) {
            return Promise.reject({
                response: {
                    status: 401,
                    data: {
                        message: "email hoặc mật khẩu không đúng"
                    }
                }
            });
        }

        // Generate mock token (không chứa user info)
        const token = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Return user data without password
        const { password: _, ...account } = user;

        return {
            data: {
                success: true,
                payload: {
                    token,
                    account
                }
            }
        };
    },

    // Mock register
    async register(userData) {
        await delay(1000); // Simulate network delay

        const { email, password, fullname, phone } = userData;

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
            account_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            username: email.split('@')[0],
            email,
            password, // In real app, this would be hashed
            fullname,
            phone_number: phone,
            permission: "driver",
            status: "active"
        };

        // Add to mock database
        mockUsers.push(newUser);

        // Generate mock token
        const token = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Return user data without password
        const { password: _, ...account } = newUser;

        return {
            data: {
                success: true,
                payload: {
                    token,
                    account
                }
            }
        };
    },


    // Mock logout
    async logout() {
        await delay(300);

        // Xóa thông tin user khi logout
        localStorage.removeItem("currentUser");
        sessionStorage.removeItem("currentUser");

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

        // Check both localStorage and sessionStorage for token
        const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
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

        // Lấy thông tin user từ storage
        const userInfoStr = localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser");
        if (!userInfoStr) {
            return Promise.reject({
                response: {
                    status: 401,
                    data: {
                        message: "Người dùng không tồn tại"
                    }
                }
            });
        }

        const account = JSON.parse(userInfoStr);

        return {
            data: {
                success: true,
                payload: {
                    account
                }
            }
        };
    },

    // Mock update profile
    async updateProfile(profileData) {
        await delay(600);

        // Check both localStorage and sessionStorage for token
        const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
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

        // Lấy thông tin user từ storage
        const userInfoStr = localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser");
        if (!userInfoStr) {
            return Promise.reject({
                response: {
                    status: 401,
                    data: {
                        message: "Người dùng không tồn tại"
                    }
                }
            });
        }

        const currentUser = JSON.parse(userInfoStr);

        // Tìm user trong mock database
        const userIndex = mockUsers.findIndex(u => u.account_id === currentUser.account_id);

        if (userIndex === -1) {
            return Promise.reject({
                response: {
                    status: 401,
                    data: {
                        message: "Người dùng không tồn tại"
                    }
                }
            });
        }

        // Map field names từ frontend sang backend format
        const updatedData = {
            fullname: profileData.fullname,
            phone_number: profileData.phone || profileData.phone_number,
        };

        // Update user data in mock database
        mockUsers[userIndex] = {
            ...mockUsers[userIndex],
            ...updatedData,
            // Ensure email cannot be changed
            email: mockUsers[userIndex].email
        };

        const { password: _, ...account } = mockUsers[userIndex];

        // Cập nhật lại storage
        if (localStorage.getItem("currentUser")) {
            localStorage.setItem("currentUser", JSON.stringify(account));
        } else if (sessionStorage.getItem("currentUser")) {
            sessionStorage.setItem("currentUser", JSON.stringify(account));
        }

        return {
            data: {
                success: true,
                payload: {
                    account
                }
            }
        };
    }
};

// Export mock users for testing
export const getMockUsers = () => mockUsers.map(({ password, ...user }) => user);
