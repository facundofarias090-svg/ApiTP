# 1. Imagen de compilación con SDK de .NET 8
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiamos todo el contenido del repositorio
COPY . .

# Nos movemos a la carpeta del backend donde están el .csproj y el código
WORKDIR /src/BACK

# Compilamos especificando la salida a /app
RUN dotnet publish -c Release -o /app

# 2. Imagen final para ejecutar
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app .

ENV ASPNETCORE_HTTP_PORTS=10000

ENTRYPOINT ["dotnet", "ApiTP.dll"]