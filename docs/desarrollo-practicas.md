LEVANTAMIENTO DE INFORMACIÓN
Con el propósito de comprender el funcionamiento actual de los procesos administrativos de la empresa, se realizó un levantamiento de información mediante observación directa, revisión de documentos internos y conversaciones informales con el personal encargado de las áreas de inventarios, compras y ventas.
Durante esta actividad se identificó que la empresa cuenta con procedimientos de trabajo establecidos y una metodología definida para el manejo de la información; sin embargo, gran parte de estos procesos se ejecutan de forma manual o mediante archivos de Microsoft Excel, lo que dificulta la centralización y consulta inmediata de los datos.
Gestión de inventarios
Se evidenció que la empresa realiza un seguimiento periódico de las materias primas utilizadas en la elaboración de productos de aseo. La información de existencias es registrada en hojas de cálculo, donde se consolidan las cantidades disponibles, las entradas por compras y las salidas derivadas de la producción.
Asimismo, se identificó que el inventario de producto terminado es actualizado manualmente conforme se finalizan los procesos productivos y se despachan pedidos a clientes.
Actualmente, la empresa no dispone de un mecanismo automático que permita generar alertas cuando una materia prima alcanza niveles mínimos de existencia, por lo que la necesidad de realizar compras depende principalmente de la experiencia y supervisión del personal administrativo.
Gestión de proveedores
Se encontró que la empresa mantiene un listado de proveedores habituales que suministran materias primas e insumos necesarios para la producción.
La información relacionada con proveedores, como datos de contacto, precios de compra y tiempos de entrega, se encuentra distribuida en archivos electrónicos y registros históricos de compras.
Cuando se requiere adquirir nuevas materias primas, las solicitudes se realizan de manera manual y posteriormente se contacta al proveedor correspondiente para coordinar el despacho del material solicitado.
No se identificó un sistema que permita generar órdenes de compra estandarizadas ni realizar seguimiento al estado de las compras efectuadas.
Gestión de ventas
El proceso de ventas inicia con la recepción de pedidos por parte de los clientes, los cuales son registrados en archivos de Excel para llevar control de cantidades solicitadas, fechas de entrega y productos requeridos.
Posteriormente, esta información es utilizada para organizar la producción y preparar los despachos correspondientes.
La empresa cuenta con un software externo encargado de la emisión de facturas electrónicas; sin embargo, este sistema no proporciona funcionalidades orientadas al seguimiento de pagos, fechas de vencimiento o control de cuentas por cobrar.
Como consecuencia, el seguimiento de cartera se realiza de manera independiente, mediante consultas manuales y revisión periódica de pedidos facturados.
Como resultado del levantamiento de información se identificaron las siguientes oportunidades de mejora:
Centralizar la información administrativa en una única plataforma.
Automatizar el control de inventarios y la generación de alertas por bajo stock.
Estandarizar la generación de órdenes de compra a proveedores.
Facilitar el registro y seguimiento de pedidos de clientes.
Implementar un mecanismo que permita realizar control de cartera asociado a pedidos, incluyendo el registro manual del número de factura, fecha de vencimiento y estado de pago. 

Identificación de procesos actuales

Con el propósito de comprender el flujo de trabajo de la empresa y documentar la manera en que se desarrollan actualmente las actividades administrativas, se realizó un análisis de los procesos relacionados con inventarios, compras, pedidos, facturación y seguimiento de cartera. A partir de esta revisión fue posible identificar la secuencia de actividades ejecutadas por el personal y las herramientas utilizadas para su gestión.

Proceso actual de inventarios y compras 

Se identificó que el control de inventarios se realiza principalmente de manera empírica y basada en la experiencia del personal encargado. Aunque existe un formato diligenciado manualmente en el que se registran las materias primas que ingresan a la empresa, esta información se archiva únicamente con fines de consulta histórica y no es utilizada como herramienta para el control de existencias, el seguimiento de consumos o la toma de decisiones relacionadas con abastecimiento.

Diariamente se verifica de manera visual la disponibilidad de materias primas y, cuando se recibe un pedido por parte de un cliente, se realiza un cálculo manual para determinar si las cantidades existentes son suficientes para cubrir la producción requerida. En caso de identificar faltantes, se procede a solicitar el material necesario directamente al proveedor.

Las solicitudes de compra se realizan mediante mensajes de WhatsApp o correo electrónico, dependiendo del proveedor seleccionado. Una vez recibidos los insumos, estos son almacenados para su posterior utilización en el proceso productivo, mientras que el ingreso de las materias primas es consignado en el formato físico establecido por la empresa, sin que esta información sea posteriormente consolidada o utilizada para realizar un seguimiento en tiempo real del inventario.

El flujo identificado para este proceso es el siguiente:

Recepción de pedido del cliente
↓
Verificación manual de disponibilidad de materias primas
↓
Determinación de faltantes
↓
Solicitud de compra al proveedor mediante WhatsApp o correo electrónico
↓
Recepción de materias primas
↓
Registro manual de ingreso en formato físico
↓
Almacenamiento para producción

Proceso actual de facturación y seguimiento de cartera 

La empresa utiliza un software externo para la generación de facturas electrónicas, por lo que el proceso de facturación se encuentra separado del registro de pedidos y no presenta integración con otras actividades administrativas.

Asimismo, se identificó que dicho software no dispone de funcionalidades para realizar seguimiento de pagos, controlar fechas de vencimiento o administrar cuentas por cobrar. Debido a esta limitación, el control de cartera se realiza mediante consultas manuales y seguimiento individual a los clientes, dificultando conocer oportunamente el estado de las obligaciones pendientes.

El flujo identificado para este proceso es el siguiente:

Pedido entregado al cliente
↓
Generación de factura en software externo
↓
Registro manual de información relacionada con la factura
↓
Seguimiento periódico a pagos pendientes
↓
Confirmación de pago y actualización del estado de cartera

Hallazgos obtenidos

Como resultado de la identificación de procesos actuales, se evidenció que la empresa posee procedimientos de trabajo definidos y un historial de información que puede ser consultado para realizar seguimiento a las operaciones. Sin embargo, la ausencia de una plataforma centralizada genera dependencia de registros manuales, dificulta la trazabilidad de la información y limita el control oportuno de inventarios, compras y cartera.

Recolección de requerimientos 

Con base en el levantamiento de información realizado y en la identificación de los procesos actuales de la empresa, se procedió a determinar las funcionalidades necesarias que deberá ofrecer el sistema, los usuarios que interactuaron con él y las restricciones existentes para su implementación.

Durante el análisis se identificó que las principales necesidades de la empresa están relacionadas con la falta de centralización de la información, el control limitado de inventarios, la ausencia de mecanismos automáticos para el abastecimiento de materias primas y las dificultades para realizar seguimiento a pedidos y cuentas por cobrar.

Módulo de gestión de inventarios
El sistema deberá permitir:
Registrar materias primas y productos terminados.
Registrar ingresos de materias primas provenientes de compras.
Registrar salidas de materias primas asociadas a procesos productivos.
Consultar las existencias actuales de materias primas y productos terminados en tiempo real.
Generar alertas automáticas cuando una materia prima alcance un nivel mínimo de existencia.
Emitir sugerencias de compra con base en los niveles de inventario disponibles y los pedidos pendientes por fabricar.
Consultar el historial de movimientos de inventario.

Módulo de gestión de proveedores
El sistema deberá permitir:
Registrar y actualizar información de proveedores.
Almacenar datos de contacto, tiempos de entrega y precios de compra.
Asociar materias primas con sus proveedores habituales.
Generar órdenes de compra a partir de sugerencias emitidas por el módulo de inventarios.
Consultar el historial de compras realizadas a cada proveedor.

Módulo de gestión de ventas
El sistema deberá permitir:
Gestión de pedidos
Registrar pedidos realizados por los clientes.
Identificar el medio por el cual fue recibido el pedido (WhatsApp, correo electrónico o llamada telefónica).
Consultar pedidos pendientes de producción.
Consolidar pedidos para su posterior entrega al área de producción.
Consultar el historial de pedidos realizados por cada cliente.
Apoyo al proceso de facturación
Asociar manualmente un número de factura a cada pedido registrado.
Registrar la fecha de emisión de la factura.
Verificar si un pedido ya fue facturado.
Gestión de cartera
Registrar fechas de vencimiento de pago.
Consultar cuentas por cobrar pendientes.
Registrar pagos parciales o pagos totales realizados por los clientes.
Generar alertas sobre facturas próximas a vencer o vencidas.
Consultar el estado actual de cartera por cliente.

Análisis de requerimientos 

A partir de los requerimientos identificados durante el levantamiento de información, se realizó un análisis con el propósito de clasificarlos y priorizarlos de acuerdo con su importancia dentro de la operación de la empresa. Para ello, se dividieron en requerimientos funcionales y no funcionales, estableciendo un nivel de prioridad para facilitar el desarrollo progresivo del sistema.

Requerimientos funcionales 

Módulo de gestión de inventarios 

REQUERIMIENTO
PRIORIDAD
Consultar existencias de materias primas y productos terminados en tiempo real 
ALTA


Registrar entradas de materias primas 
ALTA
Registrar salidas de materias primas 
ALTA
Generar alertas de bajo inventario 
ALTA
Emitir sugerencias de compra 
MEDIA
Consultar historial de movimientos 
BAJA


Módulo de gestión de proveedores 


REQUERIMIENTO
PRIORIDAD
Registrar y actualizar información de proveedores 
ALTA
Asociar materias primas con proveedores 
ALTA
Generar órdenes de compra 
MEDIA 
Consultar historial de compras 
BAJA



Módulo de gestión de ventas 


REQUERIMIENTO
PRIORIDAD
Registrar pedidos de clientes 
ALTA
Consolidar pedidos para producción 
ALTA
Consultar historial de pedidos 
MEDIA
Identificar canal de recepción del pedido 
BAJA
Registrar número de factura asociado al pedido 
ALTA
Verificar estado de facturación de pedidos 
ALTA
Registrar fechas de vencimiento 
ALTA
Consultar cuentas por cobrar pendientes 
ALTA
Registrar pagos parciales y totales 
ALTA
Generar alertas por vencimientos próximos 
MEDIA
Consultar estado de cartera por cliente 
MEDIA


Requerimientos no funcionales

Además de las funcionalidades del sistema, se identificaron características relacionadas con la calidad y desempeño de la aplicación.

REQUERIMIENTO
PRIORIDAD
Interfaz sencilla e intuitiva para usuarios 
ALTA
Disponibilidad de la información en tiempo real 
ALTA
Compatibilidad con navegadores web modernos 
MEDIA
Capacidad de crecimiento para incorporar nuevos módulos 
MEDIA
Generación de reportes exportables 
BAJA






Diseño de arquitectura del sistema 
Una vez identificados y analizados los requerimientos del sistema, se procedió al diseño de la arquitectura de software con el propósito de definir la estructura general de la aplicación, la interacción entre sus módulos y las tecnologías que serán empleadas durante el desarrollo. La arquitectura propuesta busca garantizar una solución modular, escalable y de fácil mantenimiento, permitiendo que el sistema pueda adaptarse a futuras necesidades de la empresa.

Se definió una arquitectura de tipo cliente-servidor, en la cual los usuarios accederán al sistema mediante una aplicación web utilizando un navegador, mientras que el procesamiento de la información y las reglas de negocio serán ejecutadas en el servidor. Toda la información será almacenada en una base de datos relacional centralizada, permitiendo que los diferentes módulos compartan información de manera segura y consistente.

La arquitectura estará conformada por tres módulos principales: Gestión de Inventarios, Gestión de Proveedores y Gestión de Ventas, los cuales estarán conectados mediante una única base de datos. Adicionalmente, se implementará un sistema transversal de alertas y notificaciones encargado de informar eventos importantes como bajos niveles de inventario, pedidos pendientes, órdenes de compra y vencimientos de cartera.

Esta organización permitirá mantener la independencia funcional de cada módulo, facilitando el mantenimiento del sistema y permitiendo futuras ampliaciones sin afectar el funcionamiento de los demás componentes.

Arquitectura por capas

Con el fin de organizar adecuadamente el desarrollo del software, se adoptó una arquitectura por capas, separando la presentación, la lógica de negocio y el acceso a los datos.

Capa de presentación

Corresponde a la interfaz gráfica con la cual interactuarán los usuarios del sistema. Esta capa permitirá registrar, consultar y administrar la información correspondiente a inventarios, proveedores y ventas mediante una interfaz intuitiva y de fácil uso.

Las tecnologías seleccionadas para esta capa son:







Capa de lógica de negocio

La lógica de negocio será desarrollada utilizando el lenguaje de programación Python mediante el framework Django, el cual permitirá implementar de forma organizada las reglas del negocio y gestionar la comunicación entre la interfaz de usuario y la base de datos.

En esta capa se implementarán funcionalidades como:

Gestión de inventarios.
Gestión de proveedores.
Gestión de pedidos.
Asociación de pedidos con facturas.
Control de cartera.
Generación de alertas y notificaciones.
Validación de usuarios y permisos.

Capa de datos

Toda la información será almacenada en una base de datos relacional MySQL, la cual permitirá centralizar los datos de la empresa y garantizar su integridad.

Entre la información que será administrada se encuentra:
Usuarios
Clientes
Proveedores
Materias primas
Productos terminados
Movimientos de inventario
Pedidos
Órdenes de compra
Facturas
Cartera
Alertas y notificaciones


Diseño de base de datos

Una vez definidos los requerimientos funcionales y la arquitectura del sistema, se procedió al diseño de la base de datos, con el objetivo de establecer la estructura necesaria para almacenar y administrar la información generada por los diferentes módulos del software. Se optó por un modelo de base de datos relacional implementado en MySQL, debido a su confiabilidad, facilidad de administración y compatibilidad con el framework Django.

El diseño de la base de datos busca garantizar la integridad, consistencia y disponibilidad de la información, evitando duplicidad de registros y facilitando la comunicación entre los módulos de inventarios, proveedores y ventas. Para ello se identificaron las principales entidades involucradas en los procesos administrativos de la empresa y las relaciones existentes entre ellas.

Entidades principales
Usuarios
Almacena la información de las personas que utilizarán el sistema.

Atributos principales

id_usuario
nombre
correo
contraseña
rol
estado

Proveedores
Contiene la información de los proveedores de materias primas.

Atributos

id_proveedor
nombre
NIT
teléfono
correo
dirección
tiempo_entrega
observaciones

Materias Primas
Registra todas las materias primas utilizadas durante la producción.

Atributos

id_materia
nombre
unidad_medida
stock_actual
stock_mínimo
costo_promedio
estado

Compras
Registra cada compra realizada a un proveedor.

Atributos

id_compra
fecha
proveedor
observaciones
estado

Detalle Compra
Permite registrar las materias primas incluidas dentro de cada compra.

Atributos

id_detalle
compra
materia_prima
cantidad
precio_unitario

Clientes
Contiene la información de los clientes de la empresa.

Atributos

id_cliente
nombre
teléfono
correo
dirección
ciudad
observaciones

Pedidos
Registra cada pedido realizado por los clientes.

Atributos

id_pedido
cliente
fecha
estado
canal_recepción
observaciones

Detalle Pedido
Registra los productos solicitados dentro de cada pedido.

Atributos

id_detalle
pedido
producto
cantidad
precio

Productos Terminados
Almacena los productos fabricados por la empresa.

Atributos

id_producto
nombre
presentación
stock_actual
precio

Facturas
Debido a que la empresa utiliza un software externo para facturación, esta entidad únicamente almacenará la información necesaria para relacionar cada pedido con la factura correspondiente.

Atributos

id_factura
pedido
número_factura
fecha_factura

Cartera
Permite realizar seguimiento a los pagos pendientes de los clientes.

Atributos

id_cartera
factura
fecha_vencimiento
valor
saldo_pendiente
estado_pago
fecha_pago

Alertas
Registra las notificaciones generadas automáticamente por el sistema.

Atributos

id_alerta
tipo
descripción
fecha
estado
Relaciones principales
Las entidades anteriores se relacionan de la siguiente manera:
Un proveedor puede suministrar múltiples materias primas.
Un proveedor puede tener muchas compras.
Una compra puede contener varias materias primas.
Una materia prima puede aparecer en múltiples compras.
Un cliente puede realizar muchos pedidos.
Un pedido puede contener varios productos.
Un pedido genera una factura.
Una factura puede tener un registro de cartera.
El módulo de inventarios genera alertas cuando se detectan niveles mínimos de existencias.
El módulo de cartera genera alertas cuando existen pagos próximos a vencer.

Elaboración de diagramas
Como parte del proceso de análisis y diseño del sistema, se elaboraron diferentes diagramas con el propósito de representar gráficamente la estructura y el funcionamiento de la solución propuesta. Estos diagramas permiten visualizar la organización de la información, la interacción entre los diferentes módulos y el flujo de los procesos que serán implementados durante el desarrollo del software.

En primer lugar, se diseñó el Modelo Entidad–Relación (MER), el cual representa la estructura de la base de datos del sistema, identificando las principales entidades, sus atributos y las relaciones existentes entre ellas. Este modelo constituye la base para el almacenamiento de la información correspondiente a los módulos de inventarios, proveedores, ventas, cartera y alertas.

Posteriormente, se elaboró el Diagrama de Casos de Uso, mediante el cual se identifican los actores que interactúan con el sistema y las principales funcionalidades que cada uno podrá ejecutar. Este diagrama permite definir el alcance funcional del software y la interacción entre los usuarios y los diferentes módulos.

Finalmente, se desarrollaron los Diagramas de Flujo correspondientes a los procesos de gestión de inventarios, gestión de proveedores y gestión de ventas. Estos diagramas describen la secuencia lógica de actividades que seguirá el sistema para cada uno de los procesos principales, mostrando la forma en que la información fluye entre los módulos y cómo se integran las diferentes funcionalidades propuestas.

Los diagramas presentados a continuación constituyen una representación general de la arquitectura funcional del sistema y servirán como guía durante las etapas posteriores de desarrollo e implementación del software.



