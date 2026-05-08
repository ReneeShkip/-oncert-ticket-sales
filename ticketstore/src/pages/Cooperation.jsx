import { useState, useEffect, useContext } from "react"
import { NavLink } from "react-router-dom";
import { MoreContext } from "../context/MoreContext";
import { UserContext } from "../context/UserContext";

export default function Cooperation() {
    const { user } = useContext(UserContext);
    const { lang, theme } = useContext(MoreContext);
    const [form, setForm] = useState({});
    const [questions, setQuestions] = useState([]);
    const [types, setTypes] = useState([]);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => {
            const updated = { ...prev, [name]: value };
            localStorage.setItem("form", JSON.stringify(updated));
            return updated;
        });
    };

    const handleClear = (e) => {
        setForm({});
        localStorage.setItem("form", JSON.stringify({}));
    }

    const handleSubmit = async (e) => {
        console.log("handleSubmit");
        try {
            const res = await fetch("http://localhost:5000/apply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, user_id: user.id })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error);
            }

            setSubmitted(true);
            handleClear();
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    const [errors, setErrors] = useState({});

    const handleValid = async (e) => {
        e.preventDefault();
        const newErrors = {};

        questions.forEach(q => {
            const value = form[q.point];
            if (!value || value.trim() === "") {
                newErrors[q.point] = translator?.[lang].error;
            }
        });

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0)
            return
        else {
            await handleSubmit();
        }

    };

    useEffect(() => {
        fetch(`http://localhost:5000/questions`)
            .then(res => {
                if (!res.ok) {
                    throw new Error("Server error");
                }
                return res.json();
            })
            .then(data => {
                if (data) {
                    console.log(data)
                    setQuestions(data)
                }
            })
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        fetch(`http://localhost:5000/types`)
            .then(res => {
                if (!res.ok) {
                    throw new Error("Server error");
                }
                return res.json();
            })
            .then(data => {
                if (data) {
                    console.log(data)
                    setTypes(data)
                }
            })
            .catch(err => console.error(err));
    }, []);

    const translator = {
        ukr: {
            button: "Відправити",
            clearBtn: "Очистити",
            title: "Форма зв'язку",
            error: "Поле обов'язкове для заповнення"
        },
        eng: {
            button: "Submit",
            clearBtn: "Clear",
            title: "Contact form",
            error: "Required field"
        }
    }

    if (submitted) {
        return (
            <div>
                <div className="child-page">
                    <div className=" container">
                        <h1>Форма відправлена</h1>
                        <h3 className="sub_text">Дякуємо, що довіряєте нам. Відповідь нашої адміністрації надійде вам на пошту</h3>
                        <button className="submit_button">
                            <NavLink to="/">На головну</NavLink>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="child-page">
            <div className=" container">
                <h1>{translator?.[lang].title}</h1>
                <form className="form_container" onSubmit={handleValid}>
                    {questions.map(q =>
                        <div key={q.point} className="question_container">
                            <label>
                                <h3>{q?.[`title_${lang}`]}</h3>
                                <p>{q?.[`info_${lang}`]}</p>
                            </label>
                            {q.type == 'input' ?
                                <input
                                    type="text"
                                    name={q.point}
                                    value={form[q.point] || ""}
                                    onChange={handleChange}
                                    className={`inputs ${errors?.[q.point] ? `wrong_valid` : ``}`}
                                />
                                :
                                q.type == 'textarea' ?
                                    <textarea
                                        name={q.point}
                                        value={form[q.point] || ""}
                                        onChange={handleChange}
                                        className={`inputs textareas ${errors?.[q.point] ? `wrong_valid` : ``}`}
                                    />
                                    :
                                    <select value={form.event_type} onChange={handleChange} name="event_type"
                                        className={`inputs selects ${errors?.[q.point] ? `wrong_valid` : ``}`}>
                                        <option value="" disabled></option>
                                        {types.map(t => (
                                            <option key={t.id} value={t.id}>{t?.[`type_${lang}`]}</option>
                                        ))}
                                    </select>
                            }
                            {errors?.[q.point] && (
                                <div className="error">{errors[q.point]}</div>
                            )}
                        </div>
                    )}
                    <div className="button_container">
                        <button type="submit" className="submit_button">{translator?.[lang].button}</button>
                        <button onClick={handleClear} className="clear_button">{translator?.[lang].clearBtn}</button>
                    </div>
                </form>
            </div>
        </div>
    )
}