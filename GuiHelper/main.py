import socket

host = '192.168.1.199'
port = 8025

FLOOR_NUMBER = 5
buff_S = [0,0,0,0,0,0,0,0]

buff_S[0] = 0x5
buff_S[1] = 0xFF
buff_S[2] = 0xFF
buff_S[3] = 0xFF
buff_S[4] = 0xFF
buff_S[5] = 0xFF

u16CRC = 0xFFFF
checkCRC_L = 0x00
checkCRC_H = 0x00

def crc(crc,aa):
    crc ^= aa
    for i in range (0,8):
        if (crc & 1) :
            crc = (crc >> 1) ^ 0xA001
        else :
            crc = (crc >> 1)
    return crc

def send_cmd():
    s = socket.socket(socket.AF_INET,
                      socket.SOCK_STREAM)
    s.connect((host, port))
    message = bytes(buff_S)
    s.sendall(message)
    data = s.recv(512)
    response_hex = data.hex().upper()
    hex_list = [response_hex[i:i + 2] for i in range(0, len(response_hex), 2)]
    hex_space = ' '.join(hex_list)
    print(hex_space)
    s.close()



for i in range (0,6):
    u16CRC =  crc(u16CRC,buff_S[i])

checkCRC_L = (u16CRC & 0xFF)
checkCRC_H = (u16CRC >> 8)

buff_S[6] = checkCRC_L
buff_S[7] = checkCRC_H

send_cmd()







