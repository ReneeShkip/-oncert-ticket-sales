import { useState, useContext, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import "../pages/css/chat.css";
import { normalizeChats } from "../utils/normalizedchats";

export default function Chat() {
    const [hover, setHover] = useState("/svg/chat.svg");
    const [togle, setTogle] = useState(false);
    const { user, isAuth } = useContext(UserContext);
    const [input, setInput] = useState("");
    const [chater, setChat] = useState([]);
    const [mychater, setMyChat] = useState([]);
    const [isAllOpen, setAllOpen] = useState(false);
    const [activeChatId, setActiveChatId] = useState(null);

    useEffect(() => {
        if (!isAuth || !user?.id) return;
        const url =
            user.role === "admin"
                ? "http://localhost:5000/chatmsg"
                : `http://localhost:5000/chatmsg?user_id=${user.id}`;

        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error("Server error");
                return res.json();
            })
            .then(data => {
                user.role === "admin"
                    ?
                    setMyChat(normalizeChats(data))
                    :
                    setChat(data || [])
            })
            .catch(console.error);

    }, [isAuth, user?.id, user?.role]);

    const send_a_msg = async () => {
        if (!input.trim()) return;

        const body = {
            chat_id: user.role === "admin"
                ? activeChatId
                : chater[0]?.chat_id || null,
            user_id: user.id,
            text: input.trim()
        };

        try {
            const res = await fetch("http://localhost:5000/new_msg", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (!res.ok) throw new Error("Failed to send message");

            const data = await res.json();

            setChat(prev => [
                ...prev,
                {
                    id: data.message_id,
                    chat_id: body.chat_id,
                    user_id: user.id,
                    text: body.text
                }
            ]);

            setInput("");
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (user?.role === "admin") {
            setAllOpen(true);
        }
    }, [user?.role]);

    if (!isAuth) return null;
    return (
        <div className="chat">
            {togle && (
                <div className="full-chat">
                    {isAllOpen ?
                        <div>
                            <div className="chat-style">Чати</div>
                            {mychater.map(my_msg => (
                                <button key={my_msg.chat_id} className="some_chat" onClick={() => {
                                    setAllOpen(false);
                                    setChat(my_msg.messages);
                                    setActiveChatId(my_msg.chat_id);
                                }}>
                                    <div>{my_msg.messages[0].first_name}</div>
                                </button>
                            ))}
                        </div>
                        :
                        <div className="full-chat">
                            {user.role === "admin" ?
                                <button onClick={() => setAllOpen(true)} className="chat-style">Назад</button>
                                :
                                <div className="chat-style">Чат з консультантом</div>
                            }
                            <div className="flexer">
                                <div className="message system">
                                    {user.role != "admin" &&
                                        <div className="inner">
                                            Вітаємо, ви можете написати своє питання, і консультант відповість вам у робочі години
                                        </div>
                                    }
                                </div>
                                <div>
                                    {chater.map(msg => (
                                        <div
                                            key={msg.id}
                                            className={`message ${user.id === msg.user_id ? "mine" : "yours"}`}
                                        >
                                            <div className="inner">{msg.text}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="wraper">
                                <input
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                />
                                <button onClick={send_a_msg} className="my_sender">
                                    <img src="/svg/forward.svg" alt="send" />
                                </button>
                            </div>

                        </div>
                    }
                </div>
            )}

            <button
                className="chat-button"
                onMouseEnter={() => setHover("/svg/chat-hover.svg")}
                onMouseLeave={() => setHover("/svg/chat.svg")}
                onClick={() => setTogle(p => !p)}
            >
                <img src={hover} alt="chat" />
            </button>
        </div>
    );
}
