import socket
import json

def start_client():
    host = '127.0.0.1'
    port = 65434

    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client_socket.connect((host, port))

    print("Соединение с сервером установлено.")

    # Ввод данных для отправки
    with open('map.json', 'r') as f:
        message = json.load(f)

    try:
        # Проверка на валидный JSON перед отправкой
        client_socket.send(json.dumps(message).encode('utf-8'))
    except json.JSONDecodeError:
        print("Ошибка: Введите корректный JSON.")

    # Получение ответа от сервера
    new_data = client_socket.recv(1024).decode('utf-8')
    data = new_data
    while len(new_data) == 1024:
        new_data = client_socket.recv(1024).decode('utf-8')
        data += new_data
    message = json.loads(data)['message']
    print(message)

    print(json.loads(data)['data'])

    client_socket.close()

if __name__ == "__main__":
    start_client()
