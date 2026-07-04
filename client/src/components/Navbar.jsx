import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaTicketAlt } from "react-icons/fa";

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav className="bg-[#003049] shadow-[0_10px_35px_rgba(0,48,73,0.22)] border-b border-[#fcbf49]/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center py-4 gap-4">
                    <Link
                        to="/"
                        className="text-[#eae2b7] text-2xl font-bold flex items-center gap-2 tracking-wide"
                    >
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f77f00] text-white shadow-lg">
                            <FaTicketAlt />
                        </span>
                        <span>Utsavah</span>
                    </Link>
                    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                        <Link
                            to="/"
                            className="text-[#eae2b7] hover:text-white transition cursor-pointer"
                        >
                            Events
                        </Link>
                        {user ? (
                            <>
                                <Link
                                    to={
                                        user.role === "admin"
                                            ? "/admin"
                                            : "/dashboard"
                                    }
                                    className="text-[#eae2b7] hover:text-white transition"
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="bg-[#f77f00] hover:bg-[#d62828] text-white px-4 py-2 rounded-full transition shadow-md"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-[#eae2b7] hover:text-white transition"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-[#fcbf49] text-[#003049] hover:bg-[#eae2b7] px-4 py-2 rounded-full font-semibold transition shadow-md"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
