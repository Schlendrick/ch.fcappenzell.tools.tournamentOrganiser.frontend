export interface Team {
    id: number;
    name: string;
    category: string;
    captain: Captain;
    players: Array<Player>;
    uuid: string;
}

interface Captain {
    id: number;
    title: string;
    firstName: string;
    lastName: string;
    street: string;
    plz: number;
    place: string;
    email: string;
    phone: string;

}

interface Player {
    id: number;
    title: string;
    firstName: string;
    lastName: string;
    birthday: Date;
    clubPlayer: Boolean;
}