module.exports = {
    privGroups: [
        {
            id: "USERS",
            name: "User Management" // Kullanıcı Yönetimi
        },
        {
            id: "ROLES",
            name: "Role Management" // Rol Yönetimi
        },
        {
            id: "CATEGORIES",
            name: "Category Management" // Kategori Yönetimi
        },
        {
            id: "AUDITLOGS",
            name: "Audit Logs" // Denetim Kayıtları
        }
    ],

    privileges: [
        // --- USERS GRUBU ---
        {
            key: "user_view",
            name: "User View",
            group: "USERS",
            description: "Kullanıcıları görüntüleyebilir."
        },
        {
            key: "user_add",
            name: "User Add",
            group: "USERS",
            description: "Yeni kullanıcı ekleyebilir."
        },
        {
            key: "user_update",
            name: "User Update",
            group: "USERS",
            description: "Kullanıcı bilgilerini güncelleyebilir."
        },
        {
            key: "user_delete",
            name: "User Delete",
            group: "USERS",
            description: "Kullanıcıları silebilir."
        },

        // --- ROLES GRUBU ---
        {
            key: "role_view",
            name: "Role View",
            group: "ROLES",
            description: "Rolleri görüntüleyebilir."
        },
        {
            key: "role_add",
            name: "Role Add",
            group: "ROLES",
            description: "Yeni rol ekleyebilir."
        },
        {
            key: "role_update",
            name: "Role Update",
            group: "ROLES",
            description: "Rolleri güncelleyebilir."
        },
        {
            key: "role_delete",
            name: "Role Delete",
            group: "ROLES",
            description: "Rolleri silebilir."
        },

        // --- CATEGORIES GRUBU ---
        {
            key: "category_view",
            name: "Category View",
            group: "CATEGORIES",
            description: "Kategorileri görüntüleyebilir."
        },
        {
            key: "category_add",
            name: "Category Add",
            group: "CATEGORIES",
            description: "Yeni kategori ekleyebilir."
        },
        {
            key: "category_update",
            name: "Category Update",
            group: "CATEGORIES",
            description: "Kategorileri güncelleyebilir."
        },
        {
            key: "category_delete",
            name: "Category Delete",
            group: "CATEGORIES",
            description: "Kategorileri silebilir."
        },

        // --- AUDITLOGS GRUBU (Genelde sadece okuma olur) ---
        {
            key: "auditlog_view",
            name: "AuditLog View",
            group: "AUDITLOGS",
            description: "Sistem loglarını görüntüleyebilir."
        }
    ]
};