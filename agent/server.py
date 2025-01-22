import socket
import json

from agent.process import process_map


def start_server():
    host = '127.0.0.1'
    port = 65434

    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.bind((host, port))
    server_socket.listen(1)

    print(f"Сервер запущен на {host}:{port} и ожидает подключения...")
    conn, address = server_socket.accept()
    print(f"Клиент подключился с адреса: {address}")

    with server_socket.accept() as conn, address:
        while True:
            data = ""
            while True:
                data += conn.recv(1024).decode('utf-8')
                try:
                    map_info = json.loads(data)
                    break
                except json.JSONDecodeError:
                    pass

            print(f"Получен JSON от клиента: {map_info}")

            res = process_map(map_info)

            print('Ответ модели:\n', res)

            # Ответ клиенту
            conn.send(json.dumps(res).encode('utf-8'))

if __name__ == "__main__":
    start_server()