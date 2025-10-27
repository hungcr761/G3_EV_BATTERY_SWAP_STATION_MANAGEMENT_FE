const mockUsers = [
    {
        account_id: "babc8bf4-222a-4c79-b5d2-a847b6a94296",
        username: "admin",
        email: "admin@example.com",
        password: "admin1234",
        fullname: "Administrator",
        phone_number: "0123456789",
        role: "admin",
        status: "active"
    },
    {
        account_id: "6f8293dd-bf37-4b3e-9e87-fbcea5c3add7",
        username: "tynguyen",
        email: "leehongminh004@gmail.com",
        password: "H25022k5",
        fullname: "Le Hong Minh",
        phone_number: "0987654321", 
        role: "driver",
        status: "active"
    }
];

// Mock vehicles data
const mockVehicles = [
    {
        vehicle_id: "vehicle-001",
        account_id: "29c9c055-d8c9-49a8-8734-54d88332ef96",
        vin: "VF8-2024-001",
        model_id: 28,
        model_name: "VF8",
        license_plate: "51A-54321",
        battery_soh: 95,
        status: "active",
        created_at: "2025-01-15T10:30:00Z"
    },
    {
        vehicle_id: "vehicle-002",
        account_id: "29c9c055-d8c9-49a8-8734-54d88332ef96",
        vin: "5YJSA1E14HF123456",
        model_id: 27,
        model_name: "Evo200",
        license_plate: "30B-98765",
        battery_soh: 88,
        status: "active",
        created_at: "2025-02-20T14:20:00Z"
    },
    {
        vehicle_id: "vehicle-003",
        account_id: "29c9c055-d8c9-49a8-8734-54d88332ef96",
        vin: "THEON-2025-001",
        model_id: 22,
        model_name: "Theon",
        license_plate: "29A-11111",
        battery_soh: 92,
        status: "active",
        created_at: "2025-03-10T09:00:00Z"
    },
    {
        vehicle_id: "vehicle-004",
        account_id: "29c9c055-d8c9-49a8-8734-54d88332ef96",
        vin: "KLARA-2025-001",
        model_id: 21,
        model_name: "Klara S",
        license_plate: "51F-67890",
        battery_soh: 90,
        status: "active",
        created_at: "2025-04-05T11:30:00Z"
    },
    {
        vehicle_id: "vehicle-005",
        account_id: "29c9c055-d8c9-49a8-8734-54d88332ef96",
        vin: "VF9-2025-001",
        model_id: 29,
        model_name: "VF9",
        license_plate: "59C-12345",
        battery_soh: 98,
        status: "active",
        created_at: "2025-05-20T14:00:00Z"
    },
    // Vehicles for user: 6f8293dd-bf37-4b3e-9e87-fbcea5c3add7 (tynguyen)
    {
        vehicle_id: "vehicle-006",
        account_id: "6f8293dd-bf37-4b3e-9e87-fbcea5c3add7",
        vin: "THEON-2025-002",
        model_id: 22,
        model_name: "Theon",
        license_plate: "29A-12345",
        battery_soh: 92,
        status: "active",
        created_at: "2025-01-20T10:00:00Z"
    },
    {
        vehicle_id: "vehicle-007",
        account_id: "6f8293dd-bf37-4b3e-9e87-fbcea5c3add7",
        vin: "EVO200-2025-001",
        model_id: 27,
        model_name: "Evo200",
        license_plate: "30B-67890",
        battery_soh: 85,
        status: "active",
        created_at: "2025-03-15T14:30:00Z"
    }
];

// Mock payment history data (successful payments only)
const mockPayments = [
    // Payments for user: 29c9c055-d8c9-49a8-8734-54d88332ef96 (Le Hong Minh - current user)
    {
        payment_id: "pay-001",
        invoice_id: "inv-001",
        driver_id: "29c9c055-d8c9-49a8-8734-54d88332ef96",
        payment_date: "2025-10-25T09:30:00Z",
        amount: 1500000,
        payment_method: "MoMo",
        status: "completed",
        transaction_id: "MOMO111222333",
        invoice: {
            invoice_id: "inv-001",
            invoice_number: "INV-20251025-001",
            create_date: "2025-10-25",
            plan_fee: 1500000,
            total_swap_fee: 0,
            total_penalty_fee: 0,
            payment_status: "paid",
            subscription: {
                subscription_id: "sub-001",
                plan_name: "Unlimited Premium",
                vehicle: {
                    license_plate: "51A-54321",
                    model_name: "VF8"
                }
            }
        }
    },
    {
        payment_id: "pay-002",
        invoice_id: "inv-002",
        driver_id: "29c9c055-d8c9-49a8-8734-54d88332ef96",
        payment_date: "2025-09-20T14:15:00Z",
        amount: 500000,
        payment_method: "MoMo",
        status: "completed",
        transaction_id: "MOMO444555666",
        invoice: {
            invoice_id: "inv-002",
            invoice_number: "INV-20250920-002",
            create_date: "2025-09-20",
            plan_fee: 400000,
            total_swap_fee: 80000,
            total_penalty_fee: 20000,
            payment_status: "paid",
            subscription: {
                subscription_id: "sub-005",
                plan_name: "Pay Per Swap Basic",
                vehicle: {
                    license_plate: "51F-67890",
                    model_name: "Klara S"
                }
            }
        }
    },
    {
        payment_id: "pay-003",
        invoice_id: "inv-003",
        driver_id: "29c9c055-d8c9-49a8-8734-54d88332ef96",
        payment_date: "2025-08-15T11:20:00Z",
        amount: 1500000,
        payment_method: "MoMo",
        status: "completed",
        transaction_id: "MOMO777888999",
        invoice: {
            invoice_id: "inv-003",
            invoice_number: "INV-20250815-003",
            create_date: "2025-08-15",
            plan_fee: 1500000,
            total_swap_fee: 0,
            total_penalty_fee: 0,
            payment_status: "paid",
            subscription: {
                subscription_id: "sub-001",
                plan_name: "Unlimited Premium",
                vehicle: {
                    license_plate: "51A-54321",
                    model_name: "VF8"
                }
            }
        }
    },
    // Payments for user: 6f8293dd-bf37-4b3e-9e87-fbcea5c3add7 (tynguyen)
    {
        payment_id: "pay-007",
        invoice_id: "inv-007",
        driver_id: "6f8293dd-bf37-4b3e-9e87-fbcea5c3add7",
        payment_date: "2025-10-15T10:00:00Z",
        amount: 800000,
        payment_method: "MoMo",
        status: "completed",
        transaction_id: "MOMO999888777",
        invoice: {
            invoice_id: "inv-007",
            invoice_number: "INV-20251015-007",
            create_date: "2025-10-15",
            plan_fee: 800000,
            total_swap_fee: 0,
            total_penalty_fee: 0,
            payment_status: "paid",
            subscription: {
                subscription_id: "sub-007",
                plan_name: "Unlimited Basic",
                vehicle: {
                    license_plate: "29A-12345",
                    model_name: "Theon"
                }
            }
        }
    },
    {
        payment_id: "pay-008",
        invoice_id: "inv-008",
        driver_id: "6f8293dd-bf37-4b3e-9e87-fbcea5c3add7",
        payment_date: "2025-09-20T11:00:00Z",
        amount: 1000000,
        payment_method: "MoMo",
        status: "completed",
        transaction_id: "MOMO666555444",
        invoice: {
            invoice_id: "inv-008",
            invoice_number: "INV-20250920-008",
            create_date: "2025-09-20",
            plan_fee: 1000000,
            total_swap_fee: 0,
            total_penalty_fee: 0,
            payment_status: "paid",
            subscription: {
                subscription_id: "sub-008",
                plan_name: "Pay Per Swap Premium",
                vehicle: {
                    license_plate: "30B-67890",
                    model_name: "Evo200"
                }
            }
        }
    }
];

const mockVehicleModels = [
    { model_id: 19, name: 'Ludo', brand: 'VinFast', battery_type_id: 12, avg_energy_usage: '2.10' },
    { model_id: 20, name: 'Impes', brand: 'VinFast', battery_type_id: 12, avg_energy_usage: '2.20' },
    { model_id: 21, name: 'Klara S', brand: 'VinFast', battery_type_id: 10, avg_energy_usage: '2.50' },
    { model_id: 22, name: 'Theon', brand: 'VinFast', battery_type_id: 12, avg_energy_usage: '2.80' },
    { model_id: 23, name: 'Vento', brand: 'VinFast', battery_type_id: 11, avg_energy_usage: '2.60' },
    { model_id: 24, name: 'Theon S', brand: 'VinFast', battery_type_id: 12, avg_energy_usage: '2.90' },
    { model_id: 25, name: 'Vento S', brand: 'VinFast', battery_type_id: 11, avg_energy_usage: '2.70' },
    { model_id: 26, name: 'Feliz S', brand: 'VinFast', battery_type_id: 10, avg_energy_usage: '2.40' },
    { model_id: 27, name: 'Evo200', brand: 'VinFast', battery_type_id: 12, avg_energy_usage: '2.30' },
];

// Mock subscription plans (fee_slot = 0: not per swap, fee_slot > 0: per swap)
const mockSubscriptionPlans = [
    // === GÓI KHÔNG THEO LƯỢT (fee_slot = 0) ===
    {
        plan_id: 1,
        admin_id: "166220a7-cde9-43b6-9165-c83a61ae4434",
        plan_name: "Unlimited Basic",
        plan_fee: "500000.00",
        fee_slot: "0.00", // Not per swap
        penalty_fee: "50000.00",
        battery_cap: 1,
        soh_cap: "0.03",
        duration_days: 30,
        description: "Unlimited swap package - suitable for regular users",
        is_active: true
    },
    {
        plan_id: 2,
        admin_id: "166220a7-cde9-43b6-9165-c83a61ae4434",
        plan_name: "Unlimited Standard",
        plan_fee: "800000.00",
        fee_slot: "0.00", // Not per swap
        penalty_fee: "80000.00",
        battery_cap: 2,
        soh_cap: "0.05",
        duration_days: 30,
        description: "Unlimited swap package - supports 2 batteries simultaneously",
        is_active: true
    },
    {
        plan_id: 3,
        admin_id: "166220a7-cde9-43b6-9165-c83a61ae4434",
        plan_name: "Unlimited Premium",
        plan_fee: "1200000.00",
        fee_slot: "0.00", // Not per swap
        penalty_fee: "100000.00",
        battery_cap: 3,
        soh_cap: "0.07",
        duration_days: 30,
        description: "Unlimited swap package - for businesses",
        is_active: true
    },

    // === GÓI THEO LƯỢT (fee_slot > 0) ===
    {
        plan_id: 5,
        admin_id: "166220a7-cde9-43b6-9165-c83a61ae4434",
        plan_name: "Basic Plan",
        plan_fee: "200000.00",
        fee_slot: "8000.00", // Per swap fee
        penalty_fee: "200.00",
        battery_cap: 1,
        soh_cap: "0.03",
        duration_days: 30,
        description: "Basic package - pay per battery swap",
        is_active: true
    },
    {
        plan_id: 6,
        admin_id: "166220a7-cde9-43b6-9165-c83a61ae4434",
        plan_name: "Standard Plan",
        plan_fee: "350000.00",
        fee_slot: "7500.00", // Cheaper per swap fee
        penalty_fee: "400.00",
        battery_cap: 2,
        soh_cap: "0.05",
        duration_days: 30,
        description: "Standard package - pay per swap with discounted price",
        is_active: true
    },
    {
        plan_id: 7,
        admin_id: "166220a7-cde9-43b6-9165-c83a61ae4434",
        plan_name: "Premium Plan",
        plan_fee: "500000.00",
        fee_slot: "7000.00", // Lowest per swap fee
        penalty_fee: "600.00",
        battery_cap: 3,
        soh_cap: "0.07",
        duration_days: 30,
        description: "Premium package - pay per swap with best price",
        is_active: true
    }
];

// Mock subscriptions (xe đã đăng ký gói)
const mockSubscriptions = [
    // User: 29c9c055-d8c9-49a8-8734-54d88332ef96 (Le Hong Minh - current user)
    // Subscription 1: Active Unlimited Premium
    {
        subscription_id: "sub-001",
        vehicle_id: "vehicle-001",
        plan_id: 3,
        driver_id: "29c9c055-d8c9-49a8-8734-54d88332ef96",
        start_date: "2025-10-01T00:00:00Z",
        end_date: "2025-11-01T00:00:00Z",
        status: "active",
        remaining_slots: null, // Unlimited plan
        created_at: "2025-10-01T08:00:00Z",
        // Populated fields
        plan_name: "Unlimited Premium",
        plan_fee: 1500000,
        discount_percent: 15,
        fee_slot: 0,
        vehicle: {
            vehicle_id: "vehicle-001",
            license_plate: "51A-54321",
            model_name: "VF8",
            battery_soh: 95
        }
    },
    // Subscription 2: Active Pay Per Swap
    {
        subscription_id: "sub-002",
        vehicle_id: "vehicle-002",
        plan_id: 5,
        driver_id: "29c9c055-d8c9-49a8-8734-54d88332ef96",
        start_date: "2025-09-15T00:00:00Z",
        end_date: "2025-10-15T00:00:00Z",
        status: "active",
        remaining_slots: 8, // Còn 8/10 lượt
        created_at: "2025-09-15T10:30:00Z",
        plan_name: "Pay Per Swap Premium",
        plan_fee: 1000000,
        discount_percent: 20,
        fee_slot: 50000,
        vehicle: {
            vehicle_id: "vehicle-002",
            license_plate: "30B-98765",
            model_name: "Evo200",
            battery_soh: 88
        }
    },
    // Subscription 3: Expired
    {
        subscription_id: "sub-003",
        vehicle_id: "vehicle-001",
        plan_id: 1,
        driver_id: "29c9c055-d8c9-49a8-8734-54d88332ef96",
        start_date: "2025-08-01T00:00:00Z",
        end_date: "2025-09-01T00:00:00Z",
        status: "expired",
        remaining_slots: null,
        created_at: "2025-08-01T09:00:00Z",
        plan_name: "Unlimited Basic",
        plan_fee: 800000,
        discount_percent: 10,
        fee_slot: 0,
        vehicle: {
            vehicle_id: "vehicle-001",
            license_plate: "51A-54321",
            model_name: "VF8",
            battery_soh: 95
        }
    },
    // Subscription 4: Cancelled
    {
        subscription_id: "sub-004",
        vehicle_id: "vehicle-003",
        plan_id: 2,
        driver_id: "29c9c055-d8c9-49a8-8734-54d88332ef96",
        start_date: "2025-07-10T00:00:00Z",
        end_date: "2025-08-10T00:00:00Z",
        status: "cancelled",
        remaining_slots: null,
        created_at: "2025-07-10T11:20:00Z",
        plan_name: "Unlimited Standard",
        plan_fee: 1200000,
        discount_percent: 12,
        fee_slot: 0,
        vehicle: {
            vehicle_id: "vehicle-003",
            license_plate: "29A-11111",
            model_name: "Theon",
            battery_soh: 92
        }
    },
    // Subscription 5: Active Pay Per Swap (almost used up)
    {
        subscription_id: "sub-005",
        vehicle_id: "vehicle-004",
        plan_id: 4,
        driver_id: "29c9c055-d8c9-49a8-8734-54d88332ef96",
        start_date: "2025-10-10T00:00:00Z",
        end_date: "2025-11-10T00:00:00Z",
        status: "active",
        remaining_slots: 2, // Chỉ còn 2/10 lượt
        created_at: "2025-10-10T14:00:00Z",
        plan_name: "Pay Per Swap Basic",
        plan_fee: 400000,
        discount_percent: 5,
        fee_slot: 35000,
        vehicle: {
            vehicle_id: "vehicle-004",
            license_plate: "51F-67890",
            model_name: "Klara S",
            battery_soh: 90
        }
    },
    // Subscription 6: Pending (chờ thanh toán)
    {
        subscription_id: "sub-006",
        vehicle_id: "vehicle-005",
        plan_id: 3,
        driver_id: "29c9c055-d8c9-49a8-8734-54d88332ef96",
        start_date: "2025-10-25T00:00:00Z",
        end_date: "2025-11-25T00:00:00Z",
        status: "pending",
        remaining_slots: null,
        created_at: "2025-10-25T16:30:00Z",
        plan_name: "Unlimited Premium",
        plan_fee: 1500000,
        discount_percent: 15,
        fee_slot: 0,
        vehicle: {
            vehicle_id: "vehicle-005",
            license_plate: "59C-12345",
            model_name: "VF9",
            battery_soh: 98
        }
    },

    // User: 6f8293dd-bf37-4b3e-9e87-fbcea5c3add7 (tynguyen)
    // Subscription 7: Active
    {
        subscription_id: "sub-007",
        vehicle_id: "vehicle-006",
        plan_id: 1,
        driver_id: "6f8293dd-bf37-4b3e-9e87-fbcea5c3add7",
        start_date: "2025-10-15T00:00:00Z",
        end_date: "2025-11-15T00:00:00Z",
        status: "active",
        remaining_slots: null,
        created_at: "2025-10-15T10:00:00Z",
        plan_name: "Unlimited Basic",
        plan_fee: 800000,
        discount_percent: 10,
        fee_slot: 0,
        vehicle: {
            vehicle_id: "vehicle-006",
            license_plate: "29A-12345",
            model_name: "Theon",
            battery_soh: 92
        }
    },
    // Subscription 8: Active Pay Per Swap
    {
        subscription_id: "sub-008",
        vehicle_id: "vehicle-007",
        plan_id: 5,
        driver_id: "6f8293dd-bf37-4b3e-9e87-fbcea5c3add7",
        start_date: "2025-09-20T00:00:00Z",
        end_date: "2025-10-20T00:00:00Z",
        status: "active",
        remaining_slots: 5,
        created_at: "2025-09-20T11:00:00Z",
        plan_name: "Pay Per Swap Premium",
        plan_fee: 1000000,
        discount_percent: 20,
        fee_slot: 50000,
        vehicle: {
            vehicle_id: "vehicle-007",
            license_plate: "30B-67890",
            model_name: "Evo200",
            battery_soh: 85
        }
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
                        message: "Invalid email or password"
                    }
                }
            });
        }

        // Generate mock token (does not contain user info)
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
                        message: "Email already in use"
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
            role: "driver",
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

        // Remove user info when logout
        localStorage.removeItem("currentUser");
        sessionStorage.removeItem("currentUser");

        return {
            data: {
                success: true,
                message: "Logout successful"
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
                        message: "Invalid token"
                    }
                }
            });
        }

        // Get user info from storage
        const userInfoStr = localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser");
        if (!userInfoStr) {
            return Promise.reject({
                response: {
                    status: 401,
                    data: {
                        message: "User does not exist"
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
                        message: "Invalid token"
                    }
                }
            });
        }

        // Get user info from storage
        const userInfoStr = localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser");
        if (!userInfoStr) {
            return Promise.reject({
                response: {
                    status: 401,
                    data: {
                        message: "User does not exist"
                    }
                }
            });
        }

        const currentUser = JSON.parse(userInfoStr);

        // Find user in mock database
        const userIndex = mockUsers.findIndex(u => u.account_id === currentUser.account_id);

        if (userIndex === -1) {
            return Promise.reject({
                response: {
                    status: 401,
                    data: {
                        message: "User does not exist"
                    }
                }
            });
        }

        // Map field names from frontend to backend format
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

        // Update storage
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

        // Get user info from storage
        const userInfoStr = localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser");
        if (!userInfoStr) {
            return Promise.reject({
                response: {
                    status: 401,
                    data: {
                        message: "User does not exist"
                    }
                }
            });
        }

        const currentUser = JSON.parse(userInfoStr);

        // Filter vehicles by account_id
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

        // Get user info from storage
        const userInfoStr = localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser");
        if (!userInfoStr) {
            return Promise.reject({
                response: {
                    status: 401,
                    data: {
                        message: "User does not exist"
                    }
                }
            });
        }

        const currentUser = JSON.parse(userInfoStr);

        // Check if VIN already exists
        const existingVehicle = mockVehicles.find(v => v.vin === vehicleData.vin);
        if (existingVehicle) {
            return Promise.reject({
                response: {
                    status: 400,
                    data: {
                        message: "VIN already exists in system"
                    }
                }
            });
        }

        // Create new vehicle
        const newVehicle = {
            vehicle_id: `vehicle-${Date.now()}`,
            account_id: currentUser.account_id,
            vin: vehicleData.vin,
            model: vehicleData.model,
            license_plate: vehicleData.license_plate || vehicleData.licensePlate,
            battery_soh: 100, // New vehicle has 100% SoH
            status: "active",
            created_at: new Date().toISOString()
        };

        mockVehicles.push(newVehicle);

        return {
            data: {
                success: true,
                message: "Vehicle added successfully",
                payload: {
                    vehicle: newVehicle
                }
            }
        };
    },

    // Mock update vehicle
    async updateVehicle(vehicleId, vehicleData) {
        await delay(600);

        // Get user info from storage
        const userInfoStr = localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser");
        if (!userInfoStr) {
            return Promise.reject({
                response: {
                    status: 401,
                    data: {
                        message: "User does not exist"
                    }
                }
            });
        }

        const currentUser = JSON.parse(userInfoStr);

        // Find vehicle
        const vehicleIndex = mockVehicles.findIndex(
            v => v.vehicle_id === vehicleId && v.account_id === currentUser.account_id
        );

        if (vehicleIndex === -1) {
            return Promise.reject({
                response: {
                    status: 404,
                    data: {
                        message: "Vehicle not found"
                    }
                }
            });
        }

        // Check if new VIN conflicts with other vehicles
        if (vehicleData.vin !== mockVehicles[vehicleIndex].vin) {
            const existingVehicle = mockVehicles.find(
                v => v.vin === vehicleData.vin && v.vehicle_id !== vehicleId
            );
            if (existingVehicle) {
                return Promise.reject({
                    response: {
                        status: 400,
                        data: {
                            message: "VIN already exists in system"
                        }
                    }
                });
            }
        }

        // Update vehicle
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
                message: "Vehicle updated successfully",
                payload: {
                    vehicle: mockVehicles[vehicleIndex]
                }
            }
        };
    },

    // Mock delete vehicle
    async deleteVehicle(vehicleId) {
        await delay(500);

        // Get user info from storage
        const userInfoStr = localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser");
        if (!userInfoStr) {
            return Promise.reject({
                response: {
                    status: 401,
                    data: {
                        message: "User does not exist"
                    }
                }
            });
        }

        const currentUser = JSON.parse(userInfoStr);

        // Find vehicle
        const vehicleIndex = mockVehicles.findIndex(
            v => v.vehicle_id === vehicleId && v.account_id === currentUser.account_id
        );

        if (vehicleIndex === -1) {
            return Promise.reject({
                response: {
                    status: 404,
                    data: {
                        message: "Vehicle not found"
                    }
                }
            });
        }

        // Delete vehicle
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
    },

    // Mock get subscription plans
    async getSubscriptionPlans() {
        await delay(500);

        return {
            data: {
                success: true,
                payload: {
                    subscriptionPlans: mockSubscriptionPlans
                }
            }
        };
    },

    // Mock get vehicles without subscription
    async getVehiclesWithoutSubscription() {
        await delay(600);

        // Get user info from storage
        const userInfoStr = localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser");
        if (!userInfoStr) {
            return Promise.reject({
                response: {
                    status: 401,
                    data: {
                        message: "User does not exist"
                    }
                }
            });
        }

        const currentUser = JSON.parse(userInfoStr);
        console.log('🔍 Current User:', currentUser);
        console.log('🔍 Current User account_id:', currentUser.account_id);
        console.log('🔍 All mock vehicles:', mockVehicles);

        // Lấy tất cả xe của user
        const userVehicles = mockVehicles.filter(v => v.account_id === currentUser.account_id);
        console.log('🚗 User vehicles:', userVehicles);

        // Lọc ra xe chưa có subscription
        const vehicleIdsWithSubscription = mockSubscriptions.map(sub => sub.vehicle_id);
        console.log('📋 Vehicle IDs with subscription:', vehicleIdsWithSubscription);

        const vehiclesWithout = userVehicles.filter(
            v => !vehicleIdsWithSubscription.includes(v.vehicle_id)
        );
        console.log('✅ Vehicles without subscription:', vehiclesWithout);

        return {
            data: {
                success: true,
                payload: {
                    vehicles: vehiclesWithout
                }
            }
        };
    },

    // Mock get subscriptions by user
    async getSubscriptionsByUserId(userId) {
        await delay(500);

        const userSubscriptions = mockSubscriptions.filter(sub => sub.user_id === userId);

        return {
            data: {
                success: true,
                payload: {
                    subscriptions: userSubscriptions
                }
            }
        };
    },

    // Mock get subscription plan by ID
    async getSubscriptionPlanById(id) {
        await delay(300);

        const plan = mockSubscriptionPlans.find(p => p.plan_id == id);
        if (!plan) {
            return Promise.reject({
                response: {
                    status: 404,
                    data: {
                        message: "Gói dịch vụ không tồn tại"
                    }
                }
            });
        }

        return {
            data: {
                success: true,
                payload: plan
            }
        };
    },

    // Mock get vehicle by ID
    async getVehicleById(id) {
        await delay(300);

        const vehicle = mockVehicles.find(v => v.vehicle_id === id);
        if (!vehicle) {
            return Promise.reject({
                response: {
                    status: 404,
                    data: {
                        message: "Xe không tồn tại"
                    }
                }
            });
        }

        return {
            data: {
                success: true,
                payload: vehicle
            }
        };
    },

    // Mock get payment history by driver ID
    async getPaymentHistory(driverId) {
        await delay(500);

        const driverPayments = mockPayments.filter(p => p.driver_id === driverId);
        
        // Sort by payment date descending (newest first)
        const sortedPayments = driverPayments.sort((a, b) => 
            new Date(b.payment_date) - new Date(a.payment_date)
        );

        return {
            data: {
                success: true,
                payload: {
                    payments: sortedPayments
                }
            }
        };
    }
};

// Export mock users for testing
export const getMockUsers = () => mockUsers.map(({ password, ...user }) => user);
export const getMockVehicles = () => mockVehicles;
