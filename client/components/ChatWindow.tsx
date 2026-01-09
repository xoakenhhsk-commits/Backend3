import React, { useEffect, useState, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { Send, Image as ImageIcon, Paperclip, Smile, MoreVertical, Phone, Video } from 'lucide-react';

interface Message {
    room: string;
    author: string;
    message?: string;
    file?: string; // base64
    fileName?: string;
    type: 'text' | 'image' | 'file';
    time: string;
}

interface ChatWindowProps {
    socket: Socket;
    username: string;
    room: string;
}

export default function ChatWindow({ socket, username, room }: ChatWindowProps) {
    const [currentMessage, setCurrentMessage] = useState('');
    const [messageList, setMessageList] = useState<Message[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        socket.on("receive_message", (data: Message) => {
            setMessageList((list) => [...list, data]);
        });

        return () => {
            socket.off("receive_message");
        };
    }, [socket]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messageList]);

    const sendMessage = async () => {
        if (currentMessage !== "") {
            const messageData: Message = {
                room: room,
                author: username,
                message: currentMessage,
                type: 'text',
                time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
            };

            await socket.emit("send_message", messageData);
            setMessageList((list) => [...list, messageData]);
            setCurrentMessage("");
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result as string;
                const type = file.type.startsWith('image/') ? 'image' : 'file';
                const messageData: Message = {
                    room: room,
                    author: username,
                    file: base64,
                    fileName: file.name,
                    type: type,
                    time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
                };
                socket.emit("send_message", messageData);
                setMessageList((list) => [...list, messageData]);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="flex h-screen w-full overflow-hidden">
            {/* Sidebar (Hidden on mobile usually, but keeping simple here) */}
            <div className="w-80 glass hidden md:flex flex-col border-r border-white/10">
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold text-gradient">Chats</h2>
                    <div className="mt-4 bg-white/5 rounded-lg p-2 flex items-center">
                        <span className="material-symbols-rounded text-gray-400 mr-2">search</span>
                        <input type="text" placeholder="Search..." className="bg-transparent focus:outline-none text-sm w-full text-white" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    <div className="p-3 bg-white/10 rounded-xl flex items-center gap-3 cursor-pointer ring-1 ring-purple-500/50">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold text-white">#</div>
                        <div>
                            <h3 className="font-medium text-white">{room}</h3>
                            <p className="text-xs text-gray-400">Active now</p>
                        </div>
                    </div>
                    {/* Mock other chats */}
                    <div className="p-3 hover:bg-white/5 rounded-xl flex items-center gap-3 cursor-pointer opacity-50">
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white">G</div>
                        <div>
                            <h3 className="font-medium text-white">General</h3>
                            <p className="text-xs text-gray-400">Joined</p>
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t border-white/10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center justify-center text-black font-bold">
                        {username[0]?.toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                        <p className="font-medium truncate text-white">{username}</p>
                        <p className="text-xs text-green-400 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-400 rounded-full"></span> Online
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Chat */}
            <div className="flex-1 flex flex-col relative">
                {/* Header */}
                <div className="glass-light h-16 flex items-center justify-between px-6 z-10 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="md:hidden w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold text-white">{room[0]?.toUpperCase()}</div>
                        <h3 className="font-bold text-lg text-white">{room}</h3>
                    </div>
                    <div className="flex items-center gap-4 text-gray-300">
                        <button className="hover:bg-white/10 p-2 rounded-full transition"><Phone size={20} /></button>
                        <button className="hover:bg-white/10 p-2 rounded-full transition"><Video size={20} /></button>
                        <button className="hover:bg-white/10 p-2 rounded-full transition"><MoreVertical size={20} /></button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messageList.map((msg, idx) => {
                        const isMe = msg.author === username;
                        return (
                            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] md:max-w-[50%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                        {!isMe && <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs text-white">{msg.author[0]}</div>}

                                        <div className={`p-4 rounded-2xl ${isMe
                                                ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-tr-sm'
                                                : 'bg-white/10 border border-white/5 text-gray-100 rounded-tl-sm'
                                            } shadow-md backdrop-blur-sm`}>

                                            {msg.type === 'text' && <p>{msg.message}</p>}
                                            {msg.type === 'image' && (
                                                <img src={msg.file} alt="sent" className="rounded-lg max-h-60 object-cover" />
                                            )}
                                            {msg.type === 'file' && (
                                                <a href={msg.file} download={msg.fileName} className="flex items-center gap-2 underline">
                                                    <span className="material-symbols-rounded">description</span>
                                                    {msg.fileName}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-gray-500 mt-1 px-2">{msg.time} • {msg.author}</span>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={scrollRef} />
                </div>

                {/* Input */}
                <div className="p-4 glass-light">
                    <div className="bg-white/5 border border-white/10 rounded-full px-4 py-2 flex items-center gap-3">
                        <label className="cursor-pointer text-gray-400 hover:text-white transition">
                            <Paperclip size={20} />
                            <input type="file" className="hidden" onChange={handleFileUpload} />
                        </label>
                        <label className="cursor-pointer text-gray-400 hover:text-white transition">
                            <ImageIcon size={20} />
                            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                        </label>

                        <input
                            type="text"
                            value={currentMessage}
                            onChange={(e) => setCurrentMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            className="flex-1 bg-transparent focus:outline-none text-white placeholder-gray-500"
                            placeholder="Type a message..."
                        />

                        <button className="text-gray-400 hover:text-yellow-400 transition">
                            <Smile size={20} />
                        </button>
                        <button
                            onClick={sendMessage}
                            className="bg-purple-600 hover:bg-purple-500 text-white p-2 rounded-full transition shadow-lg shadow-purple-600/20"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
