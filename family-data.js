/**
 * FAMILY DATA
 * 
 * Edit this file to update your family tree, then refresh the page.
 * 
 * Each member needs:
 *   - id: unique identifier (lowercase, no spaces)
 *   - name: display name
 *   - role: relationship label (e.g. "Father", "Grandmother")
 *   - generation: 1 = grandparents, 2 = parents/children, 3 = grandchildren, etc.
 *   - image: path to photo (leave "" for default avatar)
 *   - side: "paternal", "maternal", or "other" (for color coding)
 *   - parents: array of parent IDs (optional, links child to parents)
 */
const FAMILY_DATA = {
  "title": "The Madihlaba Family Tree",
  "subtitle": "Trace your ancestry, starting with the grandparents, then move forward generation by generation.",
  "members": [
    {
      "id": "ranko",
      "name": "Joseph Lephatse Madihlaba(Ranko)",
      "role": "Grandfather",
      "generation": 1,
      "image": "",
      "side": "paternal"
    },
    {
      "id": "manko",
      "name": "Ledia Tefu Madihlaba(Manko)",
      "role": "Grandmother",
      "generation": 1,
      "image": "",
      "side": "maternal"
    },
    {
      "id": "shim",
      "name": "Shima Madihlaba",
      "role": "Child",
      "generation": 2,
      "image": "",
      "side": "paternal",
      "parents": [
        "ranko",
        "manko"
      ]
    },
    {
      "id": "sanki",
      "name": "Sanki Madihlaba",
      "role": "Child",
      "generation": 2,
      "image": "",
      "side": "paternal",
      "parents": [
        "ranko",
        "manko"
      ]
    },
    {
      "id": "mboni",
      "name": "Mboni Madihlaba",
      "role": "Child",
      "generation": 2,
      "image": "",
      "side": "paternal",
      "parents": [
        "ranko",
        "manko"
      ]
    },
    {
      "id": "ntutu",
      "name": "Ntutu Madihlaba",
      "role": "Child",
      "generation": 2,
      "image": "",
      "side": "paternal",
      "parents": [
        "ranko",
        "manko"
      ]
    },
    {
      "id": "mabatho",
      "name": "Mabatho Madihlaba",
      "role": "Child",
      "generation": 2,
      "image": "",
      "side": "paternal",
      "parents": [
        "ranko",
        "manko"
      ]
    },
    {
      "id": "maki",
      "name": "Maki Madihlaba",
      "role": "Child",
      "generation": 2,
      "image": "",
      "side": "paternal",
      "parents": [
        "ranko",
        "manko"
      ]
    },
    {
      "id": "mahlodi",
      "name": "Mahlodi Madihlaba",
      "role": "Child",
      "generation": 2,
      "image": "",
      "side": "paternal",
      "parents": [
        "ranko",
        "manko"
      ]
    },
    {
      "id": "linda",
      "name": "Linda",
      "role": "Grandchild",
      "generation": 3,
      "image": "",
      "side": "maternal",
      "parents": [
        "mabatho"
      ]
    },
    {
      "id": "kutlwano",
      "name": "Kutlwano",
      "role": "Grandchild",
      "generation": 3,
      "image": "",
      "side": "maternal",
      "parents": [
        "mabatho"
      ]
    },
    {
      "id": "thato",
      "name": "Thato",
      "role": "Grandchild",
      "generation": 3,
      "image": "",
      "side": "maternal",
      "parents": [
        "mabatho"
      ]
    },
    {
      "id": "kgantsho",
      "name": "Kgantsho",
      "role": "Grandchild",
      "generation": 3,
      "image": "",
      "side": "maternal",
      "parents": [
        "mahlodi"
      ]
    },
    {
      "id": "pasi",
      "name": "Pasi",
      "role": "Grandchild",
      "generation": 3,
      "image": "",
      "side": "maternal",
      "parents": [
        "maki"
      ]
    },
    {
      "id": "joy",
      "name": "Joy",
      "role": "Grandchild",
      "generation": 3,
      "image": "",
      "side": "maternal",
      "parents": [
        "maki"
      ]
    },
    {
      "id": "pinkie",
      "name": "Pinkie",
      "role": "Grandchild",
      "generation": 3,
      "image": "",
      "side": "paternal",
      "parents": [
        "ntutu"
      ]
    },
    {
      "id": "lokisang",
      "name": "Lokisang",
      "role": "Grandchild",
      "generation": 3,
      "image": "",
      "side": "paternal",
      "parents": [
        "ntutu"
      ]
    },
    {
      "id": "sechaba",
      "name": "Sechaba",
      "role": "Grandchild",
      "generation": 3,
      "image": "",
      "side": "paternal",
      "parents": [
        "sanki"
      ]
    },
    {
      "id": "martha",
      "name": "Martha",
      "role": "Grandchild",
      "generation": 3,
      "image": "",
      "side": "paternal",
      "parents": [
        "sanki"
      ]
    },
    {
      "id": "lerato",
      "name": "Lerato",
      "role": "Grandchild",
      "generation": 3,
      "image": "",
      "side": "paternal",
      "parents": [
        "shim"
      ]
    },
    {
      "id": "stutu",
      "name": "Stutu",
      "role": "Grandchild",
      "generation": 3,
      "image": "",
      "side": "paternal",
      "parents": [
        "mboni"
      ]
    },
    {
      "id": "lebo",
      "name": "Lebo",
      "role": "Grandchild",
      "generation": 3,
      "image": "",
      "side": "paternal",
      "parents": [
        "mboni"
      ]
    },
    {
      "id": "motshewa",
      "name": "Motshewa",
      "role": "Grandchild",
      "generation": 3,
      "image": "",
      "side": "paternal",
      "parents": [
        "mboni"
      ]
    },
    {
      "id": "sara",
      "name": "Sara",
      "role": "Grandchild",
      "generation": 3,
      "image": "",
      "side": "paternal",
      "parents": [
        "mboni"
      ]
    },
    {
      "id": "bonolo",
      "name": "Bonolo",
      "role": "Grandchild",
      "generation": 3,
      "image": "",
      "side": "paternal",
      "parents": [
        "ntutu"
      ]
    },
    {
      "id": "rate",
      "name": "Oratile(Rati)",
      "role": "Great Grandchild",
      "generation": 4,
      "image": "",
      "side": "maternal",
      "parents": [
        "pasi"
      ]
    },
    {
      "id": "boy",
      "name": "Reatlegile(Boy)",
      "role": "Great Grandchild",
      "generation": 4,
      "image": "",
      "side": "paternal",
      "parents": [
        "pinkie"
      ]
    },
    {
      "id": "tumi",
      "name": "Boitumelo(Tumi)",
      "role": "Great Grandchild",
      "generation": 4,
      "image": "",
      "side": "paternal",
      "parents": [
        "pinkie"
      ]
    },
    {
      "id": "bokang",
      "name": "Bokang",
      "role": "Great Grandchild",
      "generation": 4,
      "image": "",
      "side": "paternal",
      "parents": [
        "martha"
      ]
    },
    {
      "id": "karabo",
      "name": "Karabo",
      "role": "Great Grandchild",
      "generation": 4,
      "image": "",
      "side": "paternal",
      "parents": [
        "sechaba"
      ]
    },
    {
      "id": "thuso",
      "name": "Thuso",
      "role": "Great Grandchild",
      "generation": 4,
      "image": "",
      "side": "paternal",
      "parents": [
        "stutu"
      ]
    },
    {
      "id": "kamo",
      "name": "Kamo",
      "role": "Great Grandchild",
      "generation": 4,
      "image": "",
      "side": "paternal",
      "parents": [
        "lebo"
      ]
    },
    {
      "id": "joy_lebo",
      "name": "Kgothatso",
      "role": "Great Grandchild",
      "generation": 4,
      "image": "",
      "side": "paternal",
      "parents": [
        "lebo"
      ]
    },
    {
      "id": "bohlokwa",
      "name": "Bohlokwa",
      "role": "Great Grandchild",
      "generation": 4,
      "image": "",
      "side": "paternal",
      "parents": [
        "kgantsho"
      ]
    },
    {
      "id": "lethabo",
      "name": "Lethabo",
      "role": "Great Grandchild",
      "generation": 4,
      "image": "",
      "side": "paternal",
      "parents": [
        "kgantsho"
      ]
    },
    {
      "id": "nthabiseng",
      "name": "Nthabiseng",
      "role": "Grandchild",
      "generation": 3,
      "image": "",
      "side": "paternal",
      "parents": [
        "shim"
      ]
    },
    {
      "id": "joy_bokang",
      "name": "Joy",
      "role": "Great Great Grandchild",
      "generation": 5,
      "image": "",
      "side": "paternal",
      "parents": [
        "bokang"
      ]
    },
    {
      "id": "tshepo",
      "name": "Tshepo",
      "role": "Great Grandchild",
      "generation": 4,
      "image": "",
      "side": "paternal",
      "parents": [
        "sara"
      ]
    },
    {
      "id": "teboho",
      "name": "Teboho (Monki)",
      "role": "Great Grandchild",
      "generation": 4,
      "image": "",
      "side": "paternal",
      "parents": [
        "stutu"
      ]
    }
  ]
};
