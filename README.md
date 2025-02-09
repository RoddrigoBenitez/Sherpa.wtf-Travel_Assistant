# Sherpa.wtf-Travel_Assistant# Sherpa.wtf Travel Assistant

**Sherpa** es un asistente de viajes multiagente desarrollado en **Node.js** y **TypeScript**. La aplicación está diseñada para ayudar a los usuarios a planificar viajes sin complicaciones, proporcionando recomendaciones sobre destinos, clima, vuelos y hoteles. La arquitectura se basa en un **orquestador**, un **supervisor** y varios **agentes especializados** que se comunican a través de un **grafo de estados**.

---

## Índice

- [Características](#características)
- [Requerimientos](#requerimientos)
- [Variables de Entorno](#variables-de-entorno)
- [Instalación y Ejecución](#instalación-y-ejecución)
- [Uso y Pruebas con Postman/Thunder Client](#uso-y-pruebas-con-postmanthunder-client)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Relato de la Prueba](#relato-de-la-prueba)
- [Ampliaciones Futuras](#ampliaciones-futuras)

---

## Características

- **Asistente Multiagente:**
  - **Travel Advisor:** Recomendaciones generales de viajes utilizando **Tavily**.
  - **Weather Advisor:** Información del clima a través de la API de **OpenWeather**.
  - **Flight Advisor:** Ofertas y detalles de vuelos mediante la API de **Amadeus**.
  - **Hotel Advisor:** Opciones de hoteles usando la API de **Amadeus**.

- **Arquitectura Modular:**
  - Implementa un **orquestador** que inicia el flujo global.
  - Un **supervisor** que dirige la conversación entre agentes.
  - Un sistema de **nodos** (creados con `makeAgentNode`) para enrutar la conversación de forma inteligente.

- **Preservación de Contexto:**
  - Se utiliza **MemorySaver** para mantener el historial de la conversación y preservar el hilo mediante un **thread_id fijo**.

---


## Requerimientos

- **Node.js** (versión **18** o superior)
- **npm**

---

## Variables de Entorno

Antes de ejecutar la aplicación, crea un archivo **.env** en la carpeta raíz del proyecto (o en `Sherpa.wtf-Travel_Assistant/Backend`) y define las siguientes variables:

```env
OPENWEATHER_API_URL=<URL de la API de OpenWeather>
API_KEY=<Tu API Key de OpenWeather>
OPENAI_API_KEY=<Tu API Key de OpenAI>
AMADEUS_API_KEY=<Tu API Key de Amadeus>
AMADEUS_API_SECRET=<Tu API Secret de Amadeus>
TAVILY_API_KEY=<Tu API Key de Tavily>
```

---


## Requerimientos

- **Node.js** (versión **18** o superior)
- **npm**

---

## Variables de Entorno

Antes de ejecutar la aplicación, crea un archivo **.env** en la carpeta raíz del proyecto (o en `Sherpa.wtf-Travel_Assistant/Backend`) y define las siguientes variables:

```env
OPENWEATHER_API_URL=<URL de la API de OpenWeather>
API_KEY=<Tu API Key de OpenWeather>
OPENAI_API_KEY=<Tu API Key de OpenAI>
AMADEUS_API_KEY=<Tu API Key de Amadeus>
AMADEUS_API_SECRET=<Tu API Secret de Amadeus>
TAVILY_API_KEY=<Tu API Key de Tavily>
```

---

Pasos para Probar:

Abre Postman o Thunder Client.
Crea una nueva petición POST a http://localhost:5001/api/chat.
En la pestaña de Headers, asegúrate de incluir Content-Type: application/json.
En el Body, selecciona el formato JSON y pega el ejemplo anterior.
Envía la petición y revisa la respuesta.

### **Orquestador**
- Recibe la consulta del usuario y gestiona el flujo de la conversación.
- Inicializa el grafo del sistema con un SystemMessage global y un HumanMessage con la pregunta.
- Se encarga de mantener el hilo de la conversación utilizando un thread_id fijo ("1") y una instancia global de MemorySaver (se configura en el grafo).

### **Supervisor**
- Dirige la consulta entre los agentes disponibles (travel, hotel, flight, y otros si se agregan).
- Evalúa el historial de mensajes y decide a qué agente derivar la consulta o si la conversación debe finalizar.

### **Nodos Agentes** (creados con makeAgentNode):

Cada nodo se especializa en una función:
- **Travel Agent:**  Recomendaciones generales de viaje y destinos (usando Tavily).
- **Weather Agent:** Información del clima (usando OpenWeather).
- **Flight Agent:**  Ofertas y detalles de vuelos (usando Amadeus).
- **Hotel Agent:** Recomendaciones de hoteles (usando Amadeus).
Cada agente genera su respuesta, actualiza el estado y el flujo se rutea según el historial y las reglas definidas.
MemorySaver:

Se utiliza para preservar el historial de la conversación a lo largo del flujo, manteniendo el contexto mediante un thread_id fijo.

## Relato de la Prueba
Imagina que un cliente se acerca a Sherpa con la siguiente necesidad:

"Quiero un asistente de viajes sencillo, algo funcional que pueda ayudar a las personas a planificar viajes sin complicaciones. Necesito que sea ágil, fácil de usar y que pueda crecer con el tiempo. ¡Confío en Sherpa para resolverlo!"

El cliente, con urgencia, envía a través de Postman la siguiente consulta:

json
Copiar
Editar
```json
{
  "question": "¿Dónde hacen el mejor café de Sudamérica?"
}
```
Flujo Interno:

Orquestador:

Recibe la pregunta y crea un estado inicial que incluye instrucciones globales.
Inicia el flujo del grafo, pasando el historial (manteniendo el hilo con thread_id: "1").
Supervisor (o enrutamiento dentro de los nodos):

El supervisor evalúa el historial y decide, basándose en la conversación, si la consulta requiere una respuesta general o si debe derivarse a un agente especializado (por ejemplo, si se menciona "café" podría decidir que se trata de un tema de destino y no de clima, vuelos o hoteles).
Agentes Especializados:

Por ejemplo, el Travel Agent procesa la consulta y genera una respuesta, combinando información de su herramienta (como Tavily) y de su lógica interna.
La respuesta se actualiza en el historial y, al final del flujo, se retorna la respuesta final.
Resultado Final:
El cliente recibe una respuesta que le indica el destino o la recomendación específica relacionada con el café, o en su defecto, se le pide más información para refinar la búsqueda. Esto demuestra que Sherpa es ágil, modular y escalable, capaz de gestionar diferentes aspectos de un viaje con potencial para crecer en funcionalidades.

## Ampliaciones Futuras
- **Integración de Nuevas Herramientas:**
Agregar agentes adicionales (por ejemplo, un agente de actividades turísticas o de eventos locales).

- **Optimización del Ruteo:**
Refinar la lógica de enrutamiento centralizando la toma de decisiones en el supervisor, utilizando prompts más sofisticados o modelos de lenguaje más avanzados.

- **Soporte para Múltiples Usuarios:**
Adaptar el sistema para gestionar sesiones concurrentes mediante la generación dinámica de thread_id y el uso de instancias separadas de MemorySaver para cada usuario.

- **Interfaz de Usuario:**
En el futuro, se podría implementar un frontend (por ejemplo, en React) para interactuar de forma más amigable con Sherpa.

Sherpa.wtf Travel Assistant es una solución base funcional y escalable para la planificación de viajes, con un enfoque modular y multiagente. El sistema utiliza un orquestador para iniciar el flujo, un supervisor para dirigir la conversación, y agentes especializados para atender temas de destinos, clima, vuelos y hoteles. La aplicación está preparada para crecer y adaptarse a futuras necesidades.

