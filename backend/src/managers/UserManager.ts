import { Socket } from "socket.io";

interface User { 
    socket: Socket;
    name: string;
}

export class UserManager { 
    private users: User[];
    private queue: string[];

    constructor() { 
        this.users = [];
        this.queue = [];
    }
    
    addUser(name: string, socket: Socket) { 
        this.users.push({
            name, socket
        });
        this.queue.push(socket.id);
        this.clearQueue();

    }

    removeUser(socketId: string) { 
        this.users = this.users.filter(x => x.socket.id === socketId);
    }

    clearQueue() { 
        if (this.queue.length < 2) { 
            return;
        }
        const user1 = this.users.find(x => x.socket.id === this.queue.pop());
        const user2 = this.users.find(x => x.socket.id === this.queue.pop());
    }
}