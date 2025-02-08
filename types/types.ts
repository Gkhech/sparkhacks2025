
export interface MyRequest {
    id: number,
    context: string[]
    text: string
}

export interface MyResponse {
    id: number,
    buffer:  Buffer
}