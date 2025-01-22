from agent.model import ChatGPTAPI
from agent.rag import retrieve_related_chunks


def process_map(map_info):
    model = ChatGPTAPI()
    map_desc_help = retrieve_related_chunks(map_info['map']['description'])
    char_desc_help = []
    for character in map_info['characters']:
        char_desc_help.append(retrieve_related_chunks(character['description']))

    help = ''
    for res in map_desc_help['chunks']:
        help += res['description']
    for char in char_desc_help:
        for res in char['chunks']:
            help += res['description']

    #print('Дополнительная информация:\n', help)

    query = str(map_info) + "\n\n" + "Дополнительная информация:" + help
    action = model.generate_action(query)
    new_map_info = model.update_map(map_info, action)

    return {"message": action, "data": new_map_info}
