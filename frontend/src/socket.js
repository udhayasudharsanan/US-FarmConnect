import { io } from 'socket.io-client';

const socket = io('https://us-farmconnect.onrender.com'); // Make sure this matches your backend URL

export default socket;
