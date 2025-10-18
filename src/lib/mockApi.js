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

// Mock vehicles data
const mockVehicles = [
    {
        vehicle_id: "vehicle-001",
        account_id: "c9cd9cf5-333b-5d8a-c6e3-b958c7b95397",
        vin: "1HGBH41JXMN109186",
        model: "VinFast Theon",
        license_plate: "29A-12345",
        battery_soh: 92,
        status: "active",
        created_at: "2024-01-15T10:30:00Z"
    },
    {
        vehicle_id: "vehicle-002",
        account_id: "c9cd9cf5-333b-5d8a-c6e3-b958c7b95397",
        vin: "5YJSA1E14HF123456",
        model: "VinFast Evo200",
        license_plate: "30B-98765",
        battery_soh: 88,
        status: "active",
        created_at: "2024-02-20T14:20:00Z"
    }
];

const mockVehicleModels = [
    { model_id: 19, name: 'Ludo', brand: 'VinFast', battery_type_id: 12 , avg_energy_usage: '2.10'},
    { model_id: 20, name: 'Impes', brand: 'VinFast', battery_type_id: 12 , avg_energy_usage: '2.20'},
    { model_id: 21, name: 'Klara S', brand: 'VinFast', battery_type_id: 10 , avg_energy_usage: '2.50'},
    { model_id: 22, name: 'Theon', brand: 'VinFast', battery_type_id: 12 , avg_energy_usage: '2.80'},
    { model_id: 23, name: 'Vento', brand: 'VinFast', battery_type_id: 11 , avg_energy_usage: '2.60'},
    { model_id: 24, name: 'Theon S', brand: 'VinFast', battery_type_id: 12 , avg_energy_usage: '2.90'},
    { model_id: 25, name: 'Vento S', brand: 'VinFast', battery_type_id: 11 , avg_energy_usage: '2.70'},
    { model_id: 26, name: 'Feliz S', brand: 'VinFast', battery_type_id: 10 , avg_energy_usage: '2.40'},
    { model_id: 27, name: 'Evo200', brand: 'VinFast', battery_type_id: 12 , avg_energy_usage: '2.30'},
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
    },

    // Mock get user vehicles
    async getUserVehicles() {
        await delay(500);

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

        // Lọc xe theo account_id
        const userVehicles = mockVehicles.filter(v => v.account_id === currentUser.account_id);

        return {
            data: {
                success: true,
                payload: {
                    vehicles: userVehicles
                }
            }
        };
    },

    // Mock get vehicle models
    async getVehicleModels() {
        await delay(300);
        return {
            data: {
                success: true,
                payload: {
                    vehicleModels: mockVehicleModels
                }
            }
        };
    },

    // Mock create vehicle
    async createVehicle(vehicleData) {
        await delay(700);

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

        // Kiểm tra VIN đã tồn tại chưa
        const existingVehicle = mockVehicles.find(v => v.vin === vehicleData.vin);
        if (existingVehicle) {
            return Promise.reject({
                response: {
                    status: 400,
                    data: {
                        message: "Số VIN đã tồn tại trong hệ thống"
                    }
                }
            });
        }

        // Tạo xe mới
        const newVehicle = {
            vehicle_id: `vehicle-${Date.now()}`,
            account_id: currentUser.account_id,
            vin: vehicleData.vin,
            model: vehicleData.model,
            license_plate: vehicleData.license_plate || vehicleData.licensePlate,
            battery_soh: 100, // Xe mới có SoH là 100%
            status: "active",
            created_at: new Date().toISOString()
        };

        mockVehicles.push(newVehicle);

        return {
            data: {
                success: true,
                message: "Thêm xe thành công",
                payload: {
                    vehicle: newVehicle
                }
            }
        };
    },

    // Mock update vehicle
    async updateVehicle(vehicleId, vehicleData) {
        await delay(600);

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

        // Tìm xe
        const vehicleIndex = mockVehicles.findIndex(
            v => v.vehicle_id === vehicleId && v.account_id === currentUser.account_id
        );

        if (vehicleIndex === -1) {
            return Promise.reject({
                response: {
                    status: 404,
                    data: {
                        message: "Không tìm thấy xe"
                    }
                }
            });
        }

        // Kiểm tra VIN mới có trùng với xe khác không
        if (vehicleData.vin !== mockVehicles[vehicleIndex].vin) {
            const existingVehicle = mockVehicles.find(
                v => v.vin === vehicleData.vin && v.vehicle_id !== vehicleId
            );
            if (existingVehicle) {
                return Promise.reject({
                    response: {
                        status: 400,
                        data: {
                            message: "Số VIN đã tồn tại trong hệ thống"
                        }
                    }
                });
            }
        }

        // Cập nhật xe
        mockVehicles[vehicleIndex] = {
            ...mockVehicles[vehicleIndex],
            vin: vehicleData.vin,
            model: vehicleData.model,
            license_plate: vehicleData.license_plate || vehicleData.licensePlate,
            updated_at: new Date().toISOString()
        };

        return {
            data: {
                success: true,
                message: "Cập nhật xe thành công",
                payload: {
                    vehicle: mockVehicles[vehicleIndex]
                }
            }
        };
    },

    // Mock delete vehicle
    async deleteVehicle(vehicleId) {
        await delay(500);

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

        // Tìm xe
        const vehicleIndex = mockVehicles.findIndex(
            v => v.vehicle_id === vehicleId && v.account_id === currentUser.account_id
        );

        if (vehicleIndex === -1) {
            return Promise.reject({
                response: {
                    status: 404,
                    data: {
                        message: "Không tìm thấy xe"
                    }
                }
            });
        }

        // Xóa xe
        mockVehicles.splice(vehicleIndex, 1);

        return {
            data: {
                success: true,
                message: "Xóa xe thành công"
            }
        };
    },

    // Mock forgot password (send OTP)
    async forgotPassword(emailData) {
        await delay(1000); // Simulate network delay

        const { email } = emailData;

        // Check if user exists
        const user = mockUsers.find(u => u.email === email);

        if (!user) {
            return Promise.reject({
                response: {
                    status: 404,
                    data: {
                        message: "Email không tồn tại trong hệ thống"
                    }
                }
            });
        }

        // Generate mock OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Log OTP to console (trong production, backend sẽ gửi qua email)
        console.log('=== OTP FOR PASSWORD RESET ===');
        console.log(`Email: ${email}`);
        console.log(`OTP Code: ${otp}`);
        console.log('==============================');

        // Response giống backend thật (code 200)
        return {
            status: 200,
            data: {
                success: true,
                message: "OTP đã được gửi đến email của bạn"
            }
        };
    },

    // Mock reset password with 6-digit code
    async resetPassword(resetData) {
        await delay(1000); // Simulate network delay

        const { email, code, newPassword } = resetData;

        // Mock validation - accept any 6-digit code
        if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
            return Promise.reject({
                response: {
                    status: 400,
                    data: {
                        message: "Mã OTP không hợp lệ"
                    }
                }
            });
        }

        // Find user by email
        const userIndex = mockUsers.findIndex(u => u.email === email);
        if (userIndex === -1) {
            return Promise.reject({
                response: {
                    status: 404,
                    data: {
                        message: "Email không tồn tại trong hệ thống"
                    }
                }
            });
        }

        // Update password
        mockUsers[userIndex].password = newPassword;

        console.log('=== PASSWORD RESET WITH OTP SUCCESSFUL ===');
        console.log(`Email: ${email}`);
        console.log(`OTP Code: ${code}`);
        console.log(`New Password: ${newPassword} (đã được hash trong production)`);
        console.log('==========================================');

        // Response giống backend thật (code 200)
        return {
            status: 200,
            data: {
                success: true,
                message: "Mật khẩu đã được đặt lại thành công"
            }
        };
    },

    // Mock request verification (send OTP)
    async requestVerification(data) {
        await delay(800); // Simulate network delay

        const { email } = data;

        // Generate mock OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Log OTP to console (trong production, backend sẽ gửi qua email)
        console.log('=== OTP VERIFICATION ===');
        console.log(`Email: ${email}`);
        console.log(`OTP Code: ${otp}`);
        console.log('========================');

        return {
            data: {
                success: true,
                message: "Mã xác thực đã được gửi đến email của bạn"
            }
        };
    },

    // Mock verify email
    async verifyEmail(data) {
        await delay(600); // Simulate network delay

        const { email, code } = data;

        // Mock validation - accept any 6-digit code
        if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
            return Promise.reject({
                response: {
                    status: 400,
                    data: {
                        message: "Mã OTP không hợp lệ"
                    }
                }
            });
        }

        console.log('=== EMAIL VERIFICATION SUCCESSFUL ===');
        console.log(`Email: ${email}`);
        console.log(`OTP Code: ${code}`);
        console.log('=====================================');

        return {
            data: {
                message: "Email verified successfully! You can now complete your registration.",
                verified: true
            }
        };
    }
};

// Export mock users for testing
export const getMockUsers = () => mockUsers.map(({ password, ...user }) => user);
export const getMockVehicles = () => mockVehicles;
