NodeMap Prototype
=======

1. Install last stable node.js and mongodb
2. Install imagemagick module (% npm i -g imagemagick)
3. % git clone https://github.com/Synopticum/nodemap.git
4. Create /db directory in project folder and run mongodb (% mongod --dbpath ~/nodemap/db)
5. Run admincreate.js for create admin record in database. After the creation of the admin record in /config/env.js set _id as admin record id (http://hsto.org/files/6ef/0d3/ef4/6ef0d3ef44e441d2baf816606a49a3e2.png)
6. Current authorization module using passportjs OAuth, but only vk.com accounts is supported. Create and configure your vk-app in account settings and set this settings in /config/env.js. Please see vkontakte API docs or this screen: http://hsto.org/files/58c/a6e/ce5/58ca6ece5cc840ab8bc2915579666d63.png
   In english: Applications -> Manage Applications -> Create an Application
7. Run app.js
