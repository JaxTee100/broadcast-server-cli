const WebSocket = require('ws');
const readline = require('readline');
const { program } = require('commander');


//start the broadcast server
program
  .command('start')
  .description('Start the broadcast server')
  .action(() => {
    const wss = new WebSocket.Server({ port: 8080 });
    const clients = new Set();

    //triggers when new client joins the server. ws is the client
    wss.on('connection', (ws) => {
      //add the client to the set  
      clients.add(ws);
      //log the connection
      console.log('New client connected');

    //triggers when the client sends a message
      ws.on('message', (message) => {
        console.log(`Broadcasting message: ${message}`);
        //send the message to all clients except the sender
        clients.forEach(client => {

          //check if the client is not the sender and the client is open  
          if (client !== ws && client.readyState === WebSocket.OPEN) {

            //send the message to the client
            client.send(message);
          }
        });
      });

        //triggers when the client disconnects
      ws.on('close', () => {
        clients.delete(ws);
        console.log('Client disconnected');
      });
    });

    console.log('Broadcast server started on ws://localhost:8080');
  });


 //connect to the broadcast server as a client
program
  .command('connect')
  .description('Connect to the broadcast server as a client')
  .action(() => {
    const ws = new WebSocket('ws://localhost:8080');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    ws.on('open', () => {
      console.log('Connected to server. Type messages to send:');
      rl.on('line', (input) => {
        ws.send(input);
      });
    });

    ws.on('message', (message) => {
      console.log(`Received: ${message}`);
    });

    ws.on('close', () => {
      console.log('Disconnected from server');
      rl.close();
    });
  });

program.parse(process.argv);
