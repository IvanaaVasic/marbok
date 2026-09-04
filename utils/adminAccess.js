export const OWNER_EMAIL = "nikola.borisavljevic.bgd@gmail.com";

export function isOwner(user) {
    return user?.email?.trim().toLowerCase() === OWNER_EMAIL;
}
