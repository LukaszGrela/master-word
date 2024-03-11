# Master Word Admin

Admin page for Master Word app backend.

## Run locally

The local dev server is set to use port `5274`

## Production

The `.env.production` should override the `.env` variable `VITE_API_ENDPOINT` with proper API backend URI

## Security

Currently the Admin app relies on the Apache server and password protecting folder, `.htaccess` contains rule:

```
AuthType Basic
AuthName "Master Word Admin"
AuthUserFile ../.htpasswd
require valid-user
```

It references the `.htpasswd` which holds the valid user name and password created using following command:

### htpasswd

```sh
#
htpasswd -c /path/wher/to/store/.htpasswd user.name
# then enter a password
# -c means Create a new file
```

### openssl

```CLI
    openssl passwd -apr1 your_password
```

Then put the generated password to `.htpasswd` with format:

```
   <user_name>:<generated_password>
```

e.g.

```
   user.name:$apr1$ydbofBYx$6Zwbml/Poyb61IrWt6cxu0
```

Then put the `.htpasswd` file outside of the protected (containing `.htaccess` file) folder (or anywhere but remember to adjust `AuthUserFile` path in `.htaccess`).

Note: In the end in app authentication will be implemented.
