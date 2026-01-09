import React, { useState } from 'react';

interface LoginProps {
    onJoin: (username: string, room: string) => void;
}

export default function Login({ onJoin }: LoginProps) {
    const [username, setUsername] = useState('');
    const [room, setRoom] = useState('');

    const handleJoin = () => {
        if (username && room) {
            onJoin(username, room);
        }
    };

    return (
        <div className="flex items-center justify-center h-full w-full min-h-screen">
            <div className="glass p-8 rounded-2xl w-full max-w-md flex flex-col gap-6 transform transition-all hover:scale-[1.01]">
                <h1 className="text-3xl font-bold text-center text-gradient">Welcome Back</h1>
                <p className="text-gray-400 text-center">Enter your details to join the chat</p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                        <input
                            type="text"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            placeholder="e.g. cyber_ninja"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Room ID</label>
                        <input
                            type="text"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            placeholder="e.g. general"
                            value={room}
                            onChange={(e) => setRoom(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                        />
                    </div>
                </div>

                <button
                    onClick={handleJoin}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3 rounded-lg shadow-lg shadow-purple-500/30 transition-all active:scale-95"
                >
                    Join Chat
                </button>
            </div>
        </div>
    );
}
