import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
    PlusIcon,
    PencilSquareIcon,
    TrashIcon,
    XMarkIcon,
    MagnifyingGlassIcon,
    UserGroupIcon,
    KeyIcon,
} from "@heroicons/react/24/outline";

const API_BASE = `${import.meta.env.VITE_API_URL || "http://localhost:7001/api"}/user-admin`;

const ROLES = [
    { value: "superadmin", label: "Super Admin", color: "bg-red-100 text-red-700" },
    { value: "admin", label: "Admin", color: "bg-purple-100 text-purple-700" },
    { value: "central_registrar", label: "Central Registrar", color: "bg-blue-100 text-blue-700" },
    { value: "faculty_registrar", label: "Faculty Registrar", color: "bg-cyan-100 text-cyan-700" },
    { value: "dept_head", label: "Dept Head", color: "bg-teal-100 text-teal-700" },
    { value: "instructor", label: "Instructor", color: "bg-green-100 text-green-700" },
    { value: "student", label: "Student", color: "bg-amber-100 text-amber-700" },
    { value: "parent", label: "Parent", color: "bg-gray-100 text-gray-700" },
];

function getRoleBadge(role) {
    const r = ROLES.find((x) => x.value === role);
    return r ? r : { label: role, color: "bg-gray-100 text-gray-600" };
}

export default function UserManagement() {
    const { token, user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterRole, setFilterRole] = useState("");

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ username: "", email: "", password: "", role: "student" });
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);

    // Delete confirm
    const [deleteTarget, setDeleteTarget] = useState(null);

    // Reset password modal
    const [resetTarget, setResetTarget] = useState(null);
    const [resetData, setResetData] = useState({ newPassword: "", confirmPassword: "" });
    const [resetError, setResetError] = useState("");
    const [resetSuccess, setResetSuccess] = useState("");
    const [resetting, setResetting] = useState(false);

    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(API_BASE, { headers });
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    // Role priority (lower = higher rank)
    const ROLE_PRIORITY = { superadmin: 0, admin: 1, central_registrar: 2, faculty_registrar: 3, dept_head: 4, instructor: 5, student: 6, parent: 7 };

    // Filter & sort users by role rank
    const filteredUsers = users
        .filter((u) => {
            const matchSearch =
                u.username?.toLowerCase().includes(search.toLowerCase()) ||
                u.email?.toLowerCase().includes(search.toLowerCase()) ||
                u.firstName?.toLowerCase().includes(search.toLowerCase()) ||
                u.lastName?.toLowerCase().includes(search.toLowerCase());
            const matchRole = !filterRole || u.role === filterRole;
            return matchSearch && matchRole;
        })
        .sort((a, b) => (ROLE_PRIORITY[a.role] ?? 99) - (ROLE_PRIORITY[b.role] ?? 99));

    // Open modal
    const openCreate = () => {
        setEditingUser(null);
        setFormData({ username: "", email: "", password: "", role: "student" });
        setFormError("");
        setShowModal(true);
    };

    const openEdit = (u) => {
        setEditingUser(u);
        setFormData({ username: u.username, email: u.email, password: "", role: u.role });
        setFormError("");
        setShowModal(true);
    };

    // Save (create or update)
    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFormError("");

        try {
            const url = editingUser ? `${API_BASE}/${editingUser._id}` : API_BASE;
            const method = editingUser ? "PUT" : "POST";
            const body = editingUser
                ? { username: formData.username, email: formData.email, role: formData.role }
                : { ...formData };

            const res = await fetch(url, { method, headers, body: JSON.stringify(body) });
            const data = await res.json();
            if (!res.ok) {
                // Show detailed validation errors if available
                if (data.errors && Array.isArray(data.errors)) {
                    const details = data.errors.map(e => `${e.field}: ${e.message}`).join("\n");
                    throw new Error(details);
                }
                throw new Error(data.message || "Save failed");
            }

            setShowModal(false);
            fetchUsers();
        } catch (err) {
            setFormError(err.message);
        } finally {
            setSaving(false);
        }
    };

    // Delete
    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            const res = await fetch(`${API_BASE}/${deleteTarget._id}`, { method: "DELETE", headers });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Delete failed");
            }
            setDeleteTarget(null);
            fetchUsers();
        } catch (err) {
            alert(err.message);
            setDeleteTarget(null);
        }
    };

    // Reset Password
    const openResetPassword = (u) => {
        setResetTarget(u);
        setResetData({ newPassword: "", confirmPassword: "" });
        setResetError("");
        setResetSuccess("");
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setResetError("");
        setResetSuccess("");

        if (resetData.newPassword !== resetData.confirmPassword) {
            setResetError("รหัสผ่านไม่ตรงกัน");
            return;
        }
        if (resetData.newPassword.length < 6) {
            setResetError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
            return;
        }

        setResetting(true);
        try {
            const res = await fetch(`${API_BASE}/${resetTarget._id}/reset-password`, {
                method: "PATCH",
                headers,
                body: JSON.stringify({ newPassword: resetData.newPassword }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Reset failed");
            setResetSuccess("รีเซ็ตรหัสผ่านเรียบร้อยแล้ว");
            setTimeout(() => setResetTarget(null), 1500);
        } catch (err) {
            setResetError(err.message);
        } finally {
            setResetting(false);
        }
    };

    // Stats
    const stats = [
        { label: "Total Users", value: users.length, color: "from-blue-500 to-blue-600" },
        { label: "Admins", value: users.filter(u => ["admin", "superadmin"].includes(u.role)).length, color: "from-purple-500 to-purple-600" },
        { label: "Instructors", value: users.filter(u => u.role === "instructor").length, color: "from-green-500 to-green-600" },
        { label: "Students", value: users.filter(u => u.role === "student").length, color: "from-amber-500 to-amber-600" },
    ];

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <UserGroupIcon className="w-7 h-7 text-amber-500" />
                        User Management
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage users and their roles</p>
                </div>
                <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all duration-200 hover:-translate-y-0.5"
                >
                    <PlusIcon className="w-5 h-5" />
                    Add User
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {stats.map((s) => (
                    <div key={s.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                        <p className={`text-2xl font-bold bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>
                            {s.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Search & Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by username, email, or name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                        />
                    </div>
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm min-w-[160px]"
                    >
                        <option value="">All Roles</option>
                        {ROLES.map((r) => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full"></div>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <UserGroupIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No users found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="text-left px-5 py-3 font-medium text-gray-600">User</th>
                                    <th className="text-left px-5 py-3 font-medium text-gray-600">Email</th>
                                    <th className="text-left px-5 py-3 font-medium text-gray-600">Role</th>
                                    <th className="text-left px-5 py-3 font-medium text-gray-600">Joined</th>
                                    <th className="text-right px-5 py-3 font-medium text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredUsers.map((u) => {
                                    const badge = getRoleBadge(u.role);
                                    const isSelf = u._id === currentUser?.id;
                                    const isSuperadminTarget = u.role === "superadmin";
                                    const isAdmin = currentUser?.role === "admin";
                                    const canManage = !(isAdmin && isSuperadminTarget);
                                    return (
                                        <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    {u.profileImage ? (
                                                        <img
                                                            src={u.profileImage}
                                                            alt={u.username}
                                                            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                                            {u.username?.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {u.username}
                                                            {isSelf && <span className="text-xs text-amber-500 ml-1">(you)</span>}
                                                        </p>
                                                        {(u.firstName || u.lastName) && (
                                                            <p className="text-xs text-gray-400">{u.firstName} {u.lastName}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-gray-600">{u.email}</td>
                                            <td className="px-5 py-3.5">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                                                    {badge.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-gray-400 text-xs">
                                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString("th-TH") : "-"}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center justify-end gap-1">
                                                    {canManage && (
                                                        <button
                                                            onClick={() => openEdit(u)}
                                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <PencilSquareIcon className="w-4.5 h-4.5" />
                                                        </button>
                                                    )}
                                                    {currentUser?.role === "superadmin" && !isSelf && !isSuperadminTarget && (
                                                        <button
                                                            onClick={() => openResetPassword(u)}
                                                            className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                            title="Reset Password"
                                                        >
                                                            <KeyIcon className="w-4.5 h-4.5" />
                                                        </button>
                                                    )}
                                                    {canManage && !isSelf && (
                                                        <button
                                                            onClick={() => setDeleteTarget(u)}
                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <TrashIcon className="w-4.5 h-4.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingUser ? "Edit User" : "Add New User"}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <XMarkIcon className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {formError && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg mb-4 text-sm">
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    required
                                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                                />
                            </div>

                            {!editingUser && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        minLength={6}
                                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                                >
                                    {ROLES.filter((r) => {
                                        // Never allow assigning superadmin from UI
                                        if (r.value === "superadmin") return false;
                                        return true;
                                    }).map((r) => (
                                        <option key={r.value} value={r.value}>{r.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 text-sm"
                                >
                                    {saving ? "Saving..." : editingUser ? "Update" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Delete User</h3>
                        <p className="text-gray-600 text-sm mb-5">
                            Are you sure you want to delete <strong>{deleteTarget.username}</strong>? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors text-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {resetTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setResetTarget(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <KeyIcon className="w-5 h-5 text-amber-500" />
                                Reset Password
                            </h3>
                            <button onClick={() => setResetTarget(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <XMarkIcon className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">
                            ตั้งรหัสผ่านใหม่ให้ <strong>{resetTarget.username}</strong> ({getRoleBadge(resetTarget.role).label})
                        </p>

                        {resetError && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg mb-4 text-sm">
                                {resetError}
                            </div>
                        )}
                        {resetSuccess && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded-lg mb-4 text-sm">
                                {resetSuccess}
                            </div>
                        )}

                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่านใหม่</label>
                                <input
                                    type="password"
                                    value={resetData.newPassword}
                                    onChange={(e) => setResetData({ ...resetData, newPassword: e.target.value })}
                                    required
                                    minLength={6}
                                    placeholder="อย่างน้อย 6 ตัวอักษร"
                                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ยืนยันรหัสผ่าน</label>
                                <input
                                    type="password"
                                    value={resetData.confirmPassword}
                                    onChange={(e) => setResetData({ ...resetData, confirmPassword: e.target.value })}
                                    required
                                    minLength={6}
                                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setResetTarget(null)}
                                    className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    disabled={resetting || !resetData.newPassword || !resetData.confirmPassword}
                                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 text-sm"
                                >
                                    {resetting ? "กำลังรีเซ็ต..." : "รีเซ็ตรหัสผ่าน"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
