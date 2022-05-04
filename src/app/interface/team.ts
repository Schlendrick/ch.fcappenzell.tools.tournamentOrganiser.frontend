export interface ITeam {
    id: number;
    name: string;
    category: string;
    captain: ICaptain;
    players: Array<IPlayer>;
    comment: string;
    uuid: string;
}

export class Team implements ITeam {
    id!: number;
    name!: string;
    category!: string;
    captain!: ICaptain;
    players!: Array<IPlayer>;
    comment!: string;
    uuid!: string;
}

export interface ICaptain {
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

export class Captain implements ICaptain {
    id!: number;
    title!: string;
    firstName!: string;
    lastName!: string;
    street!: string;
    plz!: number;
    place!: string;
    email!: string;
    phone!: string;

}

export interface IPlayer {
    id: number;
    title: string;
    firstName: string;
    lastName: string;
    birthday: Date;
    clubPlayer: Boolean;
}

export class Player implements IPlayer {
    id!: number;
    title: string = "Herr"
    firstName!: string;
    lastName!: string;
    birthday!: Date;
    clubPlayer: Boolean = false;
}
