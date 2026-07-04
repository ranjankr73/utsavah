import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/axios";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showEventForm, setShowEventForm] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        date: "",
        location: "",
        category: "",
        totalSeats: "",
        ticketPrice: "",
        image: "",
    });

    useEffect(() => {
        if (!user || user.role !== "admin") {
            navigate("/login");
            return;
        }
        fetchData();
    }, [user, navigate]);

    const fetchData = async () => {
        try {
            const [eventsRes, bookingsRes] = await Promise.all([
                api.get("/events"),
                api.get("/bookings/my"), // Admin gets all bookings
            ]);
            setEvents(eventsRes.data);
            setBookings(bookingsRes.data);
        } catch (error) {
            console.error("Error fetching admin data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            await api.post("/events", formData);
            setShowEventForm(false);
            setFormData({
                title: "",
                description: "",
                date: "",
                location: "",
                category: "",
                totalSeats: "",
                ticketPrice: "",
                image: "",
            });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || "Error creating event");
        }
    };

    const handleDeleteEvent = async (id) => {
        if (window.confirm("Are you sure you want to delete this event?")) {
            try {
                await api.delete(`/events/${id}`);
                fetchData();
            } catch (error) {
                alert("Error deleting event");
            }
        }
    };

    const handleConfirmBooking = async (id, paymentStatus) => {
        try {
            await api.put(`/bookings/${id}/confirm`, { paymentStatus });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || "Error confirming booking");
        }
    };

    const handleCancelBooking = async (id) => {
        if (window.confirm("Cancel this user's booking request?")) {
            try {
                await api.delete(`/bookings/${id}`);
                fetchData();
            } catch (error) {
                alert(
                    error.response?.data?.message || "Error cancelling booking",
                );
            }
        }
    };

    if (loading)
        return (
            <div className="text-center py-20 text-xl font-semibold">
                Loading admin panel...
            </div>
        );

    return (
        <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-[#003049] to-[#f77f00] text-white rounded-[28px] p-6 sm:p-8 mb-8 shadow-[0_20px_45px_rgba(0,48,73,0.2)] flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">
                        Admin Dashboard
                    </h1>
                    <p className="text-[#eae2b7]">
                        Manage events and manually confirm bookings.
                    </p>
                </div>
                <button
                    onClick={() => setShowEventForm(!showEventForm)}
                    className="w-full md:w-auto bg-white text-[#003049] font-bold py-3 px-6 rounded-full hover:bg-[#eae2b7] transition shadow-md"
                >
                    {showEventForm ? "Cancel Creation" : "+ Create New Event"}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="brand-card p-6 rounded-[24px] flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">
                            Total Revenue
                        </p>
                        <h3 className="text-3xl font-black text-[#d62828]">
                            ₹
                            {bookings.reduce(
                                (sum, b) =>
                                    b.paymentStatus === "paid" &&
                                    b.status === "confirmed"
                                        ? sum + b.amount
                                        : sum,
                                0,
                            )}
                        </h3>
                    </div>
                    <div className="w-12 h-12 bg-[#eae2b7] text-[#003049] rounded-full flex items-center justify-center text-xl font-bold">
                        ₹
                    </div>
                </div>
                <div className="brand-card p-6 rounded-[24px] flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">
                            Paid Clients
                        </p>
                        <h3 className="text-3xl font-black text-[#003049]">
                            {
                                new Set(
                                    bookings
                                        .filter(
                                            (b) =>
                                                b.paymentStatus === "paid" &&
                                                b.status === "confirmed",
                                        )
                                        .map((b) => b.userId?._id),
                                ).size
                            }
                        </h3>
                    </div>
                    <div className="w-12 h-12 bg-[#fcbf49] text-[#003049] rounded-full flex items-center justify-center text-xl font-bold">
                        👤
                    </div>
                </div>
                <div className="brand-card p-6 rounded-[24px] flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">
                            Pending Requests
                        </p>
                        <h3 className="text-3xl font-black text-[#f77f00]">
                            {
                                bookings.filter((b) => b.status === "pending")
                                    .length
                            }
                        </h3>
                    </div>
                    <div className="w-12 h-12 bg-[#f77f00] text-white rounded-full flex items-center justify-center text-xl font-bold">
                        ⏳
                    </div>
                </div>
            </div>

            {showEventForm && (
                <div className="brand-card p-8 rounded-[24px] mb-8">
                    <h2 className="text-2xl font-bold mb-6 text-[#003049]">
                        Create New Event
                    </h2>
                    <form
                        onSubmit={handleCreateEvent}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        <input
                            required
                            type="text"
                            placeholder="Event Title"
                            className="border border-[#eae2b7] px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#f77f00] outline-none transition"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    title: e.target.value,
                                })
                            }
                        />
                        <input
                            required
                            type="text"
                            placeholder="Category (e.g., Tech, Music)"
                            className="border border-[#eae2b7] px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#f77f00] outline-none transition"
                            value={formData.category}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    category: e.target.value,
                                })
                            }
                        />
                        <input
                            required
                            type="date"
                            className="border border-[#eae2b7] px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#f77f00] outline-none transition"
                            value={formData.date}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    date: e.target.value,
                                })
                            }
                        />
                        <input
                            required
                            type="text"
                            placeholder="Location"
                            className="border border-[#eae2b7] px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#f77f00] outline-none transition"
                            value={formData.location}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    location: e.target.value,
                                })
                            }
                        />
                        <input
                            required
                            type="number"
                            placeholder="Total Seats"
                            className="border border-[#eae2b7] px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#f77f00] outline-none transition"
                            value={formData.totalSeats}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    totalSeats: e.target.value,
                                })
                            }
                        />
                        <input
                            required
                            type="number"
                            placeholder="Ticket Price (0 for free)"
                            className="border border-[#eae2b7] px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#f77f00] outline-none transition"
                            value={formData.ticketPrice}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    ticketPrice: e.target.value,
                                })
                            }
                        />

                        <div className="md:col-span-2">
                            <input
                                type="text"
                                placeholder="Image URL (Provide any direct link to an image)"
                                className="w-full border border-[#eae2b7] px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#f77f00] outline-none transition"
                                value={formData.image}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        image: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <textarea
                            required
                            placeholder="Event Description"
                            className="border border-[#eae2b7] px-4 py-3 rounded-xl md:col-span-2 h-32 focus:ring-2 focus:ring-[#f77f00] outline-none transition"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    description: e.target.value,
                                })
                            }
                        />
                        <button
                            type="submit"
                            className="md:col-span-2 brand-button py-3 mt-2 rounded-xl"
                        >
                            Publish Event
                        </button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="flex flex-col">
                    <h2 className="text-2xl font-bold mb-6 text-[#003049] flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#eae2b7] text-[#003049] text-sm">
                            {events.length}
                        </span>
                        All Events
                    </h2>
                    <div className="brand-card rounded-[24px] overflow-hidden">
                        <ul className="divide-y divide-[#f3eedf] max-h-[600px] overflow-y-auto">
                            {events.length === 0 ? (
                                <li className="p-6 text-gray-500 text-center">
                                    No events created yet.
                                </li>
                            ) : (
                                events.map((event) => (
                                    <li
                                        key={event._id}
                                        className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-[#fffdf9] transition border-b border-[#f3eedf] last:border-0"
                                    >
                                        <div>
                                            <h4 className="font-bold text-[#003049] mb-1 leading-tight">
                                                {event.title}
                                            </h4>
                                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                                <span className="flex items-center gap-1 font-medium">
                                                    <div className="w-2 h-2 rounded-full bg-[#f77f00]"></div>{" "}
                                                    {new Date(
                                                        event.date,
                                                    ).toLocaleDateString()}
                                                </span>
                                                <span className="flex items-center gap-1 font-medium">
                                                    <div
                                                        className={`w-2 h-2 rounded-full ${event.availableSeats > 0 ? "bg-[#fcbf49]" : "bg-[#d62828]"}`}
                                                    ></div>{" "}
                                                    {event.availableSeats}/
                                                    {event.totalSeats} seats
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() =>
                                                handleDeleteEvent(event._id)
                                            }
                                            className="w-full sm:w-auto text-red-500 hover:text-white hover:bg-red-500 border border-red-200 px-4 py-2 rounded-lg text-sm font-bold transition shadow-sm shrink-0"
                                        >
                                            Delete
                                        </button>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col">
                    <h2 className="text-2xl font-bold mb-6 text-[#003049] flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#fcbf49]/30 text-[#003049] text-sm font-bold">
                            {bookings.length}
                        </span>
                        Booking Requests
                    </h2>
                    <div className="brand-card rounded-[24px] overflow-hidden">
                        <ul className="divide-y divide-[#f3eedf] max-h-[600px] overflow-y-auto">
                            {bookings.length === 0 ? (
                                <li className="p-6 text-gray-500 text-center">
                                    No bookings yet.
                                </li>
                            ) : (
                                bookings.map((booking) => (
                                    <li
                                        key={booking._id}
                                        className={`p-6 hover:bg-[#fffdf9] transition border-l-4 ${booking.status === "pending" ? "border-l-[#fcbf49]" : booking.status === "confirmed" ? "border-l-[#f77f00]" : "border-l-[#d62828]"}`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className="font-bold text-[#003049] text-lg leading-tight">
                                                {booking.eventId?.title ||
                                                    "Deleted Event"}
                                            </h4>
                                            <div className="flex flex-col gap-1 items-end shrink-0 ml-4">
                                                <span
                                                    className={`px-2 py-1 text-[10px] font-black rounded uppercase tracking-wider ${booking.status === "confirmed" ? "bg-green-100 text-green-700" : booking.status === "cancelled" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}
                                                >
                                                    {booking.status}
                                                </span>
                                                {booking.status !==
                                                    "cancelled" && (
                                                    <span
                                                        className={`px-2 py-1 text-[10px] font-black rounded uppercase tracking-wider ${booking.paymentStatus === "paid" ? "bg-indigo-100 text-indigo-700" : "bg-gray-200 text-gray-800"}`}
                                                    >
                                                        {booking.paymentStatus.replace(
                                                            "_",
                                                            " ",
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="bg-[#fffdf9] rounded-lg p-3 mb-3 border border-[#eae2b7] text-sm">
                                            <p className="text-gray-700 flex items-center gap-2 mb-1">
                                                <span className="font-bold w-16 text-gray-500 uppercase text-xs">
                                                    User:
                                                </span>
                                                <span className="font-semibold">
                                                    {booking.userId?.name}
                                                </span>
                                                <span className="text-gray-400">
                                                    ({booking.userId?.email})
                                                </span>
                                            </p>
                                            <p className="text-gray-700 flex items-center gap-2 mb-1">
                                                <span className="font-bold w-16 text-gray-500 uppercase text-xs">
                                                    Amount:
                                                </span>
                                                <span
                                                    className={`font-semibold ${booking.amount === 0 ? "text-green-600" : ""}`}
                                                >
                                                    {booking.amount === 0
                                                        ? "Free"
                                                        : `₹${booking.amount}`}
                                                </span>
                                            </p>
                                            <p className="text-gray-700 flex items-center gap-2 mb-1">
                                                <span className="font-bold w-16 text-gray-500 uppercase text-xs">
                                                    Date:
                                                </span>
                                                <span>
                                                    {new Date(
                                                        booking.bookedAt,
                                                    ).toLocaleString()}
                                                </span>
                                            </p>
                                            {booking.eventId && (
                                                <p className="text-gray-700 flex items-center gap-2 mt-2 pt-2 border-t border-[#eae2b7]">
                                                    <span className="font-bold w-16 text-gray-500 uppercase text-xs">
                                                        Seats:
                                                    </span>
                                                    <span
                                                        className={`font-bold ${booking.eventId.availableSeats > 0 ? "text-green-600" : "text-red-500"}`}
                                                    >
                                                        {
                                                            booking.eventId
                                                                .availableSeats
                                                        }
                                                    </span>{" "}
                                                    remaining of{" "}
                                                    {booking.eventId.totalSeats}
                                                </p>
                                            )}
                                        </div>

                                        {booking.status === "pending" && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <button
                                                    onClick={() =>
                                                        handleConfirmBooking(
                                                            booking._id,
                                                            "paid",
                                                        )
                                                    }
                                                    className="flex-1 min-w-[120px] bg-green-50 text-green-700 hover:bg-green-600 hover:text-white border border-green-200 text-xs font-bold py-2.5 px-3 rounded-lg shadow-sm transition"
                                                >
                                                    ✓ Approve as Paid
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleConfirmBooking(
                                                            booking._id,
                                                            "not_paid",
                                                        )
                                                    }
                                                    className="flex-1 min-w-[120px] bg-gray-50 text-gray-700 hover:bg-gray-800 hover:text-white border border-gray-200 text-xs font-bold py-2.5 px-3 rounded-lg shadow-sm transition"
                                                >
                                                    ✓ Approve Undecided
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleCancelBooking(
                                                            booking._id,
                                                        )
                                                    }
                                                    className="w-[80px] bg-red-50 text-red-600 hover:bg-red-500 hover:text-white border border-red-200 text-xs font-bold py-2.5 px-3 rounded-lg transition"
                                                >
                                                    ✕ Reject
                                                </button>
                                            </div>
                                        )}
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
