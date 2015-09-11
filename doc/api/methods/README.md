# API Methods

All API method calls are made through `http://yourdomain.com/api/v1`.

### Teams

Method                                   | Description
---------------------------------------- | -----------
[/teams/create] (teams.md#create)        | Create a new team.

### Users

Method                                   | Description
---------------------------------------- | -----------
[/users/create] (users.md#create)        | Create a new user.

### Channels

Method                                      | Description
------------------------------------------- | -----------
[/channels/] (channels.md#get-all)          | Returns all the channels the user is in.
[/channels/create] (channels.md#create)     | Create a new channel.
[/channels/{id}/] (channels.md#get)         | Return the channel with the corresponding `id`.
[/channels/{id}/join] (channels.md#join)    | Joins channel with the the corresponding `id`.
[/channels/{id}/leave] (channels.md#leave)  | Leaves channel with the the corresponding `id`.

### Files

Method                                    | Description
----------------------------------------- | -----------
[/files/upload] (files.md#upload)         | Upload a file.
