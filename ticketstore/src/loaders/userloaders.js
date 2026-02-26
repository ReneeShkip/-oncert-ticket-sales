export async function userLoader({ params }) {
    const res = await fetch("https://jsonplaceholder.typicode.com/users");
    const users = await res.json();

    const user = users.find(u => u.id === parseInt(params.user_id));
    if (!user) throw new Response("User Not Found", { status: 404 });

    return user;
}