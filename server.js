const http = require('http');
const { v4: uuidv4 } = require('uuid');
const headers = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET, OPTIONS, DELETE',
    'Content-Type': 'application/json'
};
const { PORT = 3000} = process.env;

const sendResponse = (res, statusCode, data) => {
  res.writeHead(statusCode, headers);
  res.write(JSON.stringify(data));
  res.end();
};

const todos = [];
const server = http.createServer((req, res) => {
   let body = '';
   req.on('data', chunk => {
       body += chunk;
   })
   if (req.method == 'OPTIONS') {
      sendResponse(res, 200);
   } else if (req.url == '/todo') {
      switch (req.method) {
         case 'GET':
            sendResponse(res, 200, {
               "status": "true",
               "data": todos
           });
           break;
         case 'POST':
            req.on('end', () => {
               try {
                   let title = JSON.parse(body)?.title;
                   if (title) {
                       todos.push({
                           title,
                           'id': uuidv4()
                       })
                       sendResponse(res, 200, {
                           "status": "true",
                           "data": todos
                       })
                   } else {
                       sendResponse(res, 400, {
                           "status": "false"
                       })
                   }
               } catch (error) {
                   sendResponse(res, 400, {
                       "status": "false"
                   })
               }
            })
            break;
         case 'DELETE':
            todos.length = 0;
            sendResponse(res, 200, {
                "status": "true",
                "data": todos
            });
            break;
         default:
            sendResponse(res, 405, {
               "status": "false"
            });
            break;
      }
   } else if (req.url.startsWith('/todo/')) {
      let id = req.url.split('/').pop();
      let index = todos.findIndex(el => el.id == id);
      if (index > -1) {
          if (req.method == 'PATCH') {
            req.on('end', () => {
               try {
                   let title = JSON.parse(body)?.title;
                   if (title) {
                       todos[index].title = title;
                       sendResponse(res, 200, {
                           "status": "true",
                           "data": todos
                       })
                   } else {
                       sendResponse(res, 400, {
                           "status": "false"
                       })
                   }
               } catch (error) {
                   sendResponse(res, 405, {
                       "status": "false"
                   });
               }
           })
          } else if (req.method == 'DELETE') {
              todos.splice(index, 1);
              sendResponse(res, 200, {
                  "status": "true",
                  "data": todos
              })
          } else {
              sendResponse(res, 405, {
                  "status": "false"
              });
          }
      } else {
          sendResponse(res, 405, {
              "status": "false"
          });
      }
   } else {
      sendResponse(res, 404, {
         "status": "false"
      });
   }
});
server.listen(PORT);