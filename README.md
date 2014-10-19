NodeMap Prototype
=======

It is simple a Web Application/CMS based on node.js/express/mongodb on serverside, and leafletjs/backbonejs/fancybox on client. More info and screens(in russian): http://habrahabr.ru/post/240807/

You can:

Login from Vkontakte: http://hsto.org/files/973/758/1af/9737581afdd64948aff235b6eb5dcc4a.png , http://hsto.org/files/eb7/4c3/222/eb74c3222e844929a10e273920a9319c.png
See Dots on Map: http://hsto.org/files/bbe/21d/a21/bbe21da215e0406384e132b5e1e18869.png
Add Image Gallery for the Dots: http://hsto.org/files/19b/a3c/2eb/19ba3c2ebf5b4fdcaecb46b486b695e9.png
Add Music for the Dots: http://hsto.org/files/d63/f3e/38d/d63f3e38d7d3464db6d0686171aca5d3.png
Comment Dots: http://hsto.org/files/8f9/0f3/974/8f90f3974a584014a8cdc5eddc186d82.png
Switching between Map Layers: http://hsto.org/files/93b/ecd/c86/93becdc86b47441e97c107a987fdd3c4.png
Add Dots: http://hsto.org/files/86e/b8c/3b8/86eb8c3b89d04fdebe4c0dee86c39135.png

Admin Can:

Moderate messages: http://hsto.org/files/98b/76c/539/98b76c539b3a4fb496009e298c6699e0.png
Enable/disable moderation: http://hsto.org/files/689/cf3/956/689cf39569fd4c8da783a651e548687d.png

News: http://hsto.org/files/f9e/575/e66/f9e575e66a8745788bfa57f5e6e28c2d.png
Ads: http://hsto.org/files/9a0/655/5ec/9a06555ec88c4ebfb21f896bfcbf1317.png
Initiatives: http://hsto.org/files/1a6/fe9/0cd/1a6fe90cd37e42beb85752831a395bee.png
Complaints: http://hsto.org/files/898/bfd/67a/898bfd67aa4e434ca47eb6b52ac0ef3b.png
Anonymous: http://hsto.org/files/b50/36a/66e/b5036a66ef27422fb148c790ffb897ed.png

More: http://hsto.org/files/823/bbc/4c7/823bbc4c78ec41b981d0bc35aa9b7a41.jpg


Installation
=======

1. Install last stable node.js and mongodb
2. Install imagemagick module (% npm i -g imagemagick)
3. % git clone https://github.com/Synopticum/nodemap.git
4. Create /db directory in project folder and run mongodb (% mongod --dbpath ~/nodemap/db)
5. Run admincreate.js for create admin record in database. After the creation of the admin record in /config/env.js set _id as admin record id (http://hsto.org/files/6ef/0d3/ef4/6ef0d3ef44e441d2baf816606a49a3e2.png)
6. Current authorization module using passportjs OAuth, but only vk.com accounts is supported. Create and configure your vk-app in account settings(Applications -> Manage Applications -> Create an Application -> ...) and set this settings in /config/env.js. Please see vkontakte API docs or this screen: http://hsto.org/files/58c/a6e/ce5/58ca6ece5cc840ab8bc2915579666d63.png
7. Run app.js
