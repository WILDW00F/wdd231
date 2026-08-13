export async function getItemData() {
    try {
        const response = await fetch("data/items.json");

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching item data:", error);
        throw error;
    }
}

export function getStoredIds(key) {
    const stored = localStorage.getItem(key);

    if (!stored) {
        return [];
    }

    try {
        return JSON.parse(stored);
    } catch (error) {
        console.error(`Unable to read ${key} from localStorage:`, error);
        return [];
    }
}

export function saveStoredIds(key, ids) {
    localStorage.setItem(key, JSON.stringify(ids));
}

export function toggleStoredId(key, id) {
    const ids = getStoredIds(key);

    if (ids.includes(id)) {
        saveStoredIds(
            key,
            ids.filter(item => item !== id)
        );

        return false;
    }

    saveStoredIds(key, [...ids, id]);

    return true;
}

export function getItemById(itemData, id) {
    return itemData.find(item => item.id === id);
}