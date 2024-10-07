export interface Printer{
    id: number,
    manufacturer: string,
    model: string,
    desc: string,
    location: {
        campus: string,
        building: string,
        room: number
    }
    status: string,
    selected: boolean,
    log: string[]
}

export interface PaperType{
    type: string,
    width: number,
    height: number
}