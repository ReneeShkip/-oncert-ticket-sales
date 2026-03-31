export default function Verify() {
    return (
        <div>
            <h1>Підтвердження</h1>
            <div>
                <p>
                    Ця сторінка підтверджує, що користувач {user.first_name} {user.last_name} має справжній квиток на подію {event.ukr.title}
                </p>
            </div>
        </div>
    )
}
