# 1. Imagen de compilación con el SDK de .NET 8
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiar el código y compilar
COPY . .
RUN dotnet publish -c Release -o /app

# 2. Imagen final ligera para ejecutar la app
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app .

# Escuchar en el puerto que asigna Render automáticamente
ENV ASPNETCORE_HTTP_PORTS=10000

ENTRYPOINT ["dotnet", "ApiTP.dll"]