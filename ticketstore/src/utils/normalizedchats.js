
export const normalizeChats = (rows = []) => {
    const chats = {};

    rows.forEach(row => {
        const chatId = row.chat_id;

        if (!chats[chatId]) {
            chats[chatId] = {
                chat_id: chatId,
                messages: []
            };
        }

        chats[chatId].messages.push({
            id: row.id,
            user_id: row.user_id,
            text: row.text,
            first_name: row.first_name
        });
    });

    return Object.values(chats);
};
