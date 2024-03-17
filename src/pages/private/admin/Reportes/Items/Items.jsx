/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { ResponsiveBar } from "@nivo/bar";
import axios from "axios";
import ExcelJS from "exceljs";
import "./items.scss";
import { simboloMoneda } from "../../../../../services/global";
import SwitchModel from "../../../../../components/SwitchModel/SwitchModel";
import { MonthPickerInput } from "@mantine/dates";
import moment from "moment";

const Items = () => {
  const [data, setData] = useState([]);
  const [valorizarX, setValorizarX] = useState("cantidad");
  const [tipoFiltro, setTipoFiltro] = useState("servicios");
  const [infoProductos, setInfoProductos] = useState([]);
  const [infoServicios, setInfoServicios] = useState([]);
  const [loading, setLoading] = useState(false);

  const [datePrincipal, setDatePrincipal] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fechaConsulta = moment(datePrincipal).format("YYYY-MM-DD");
        const response = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/lava-ya/get-informacion/${fechaConsulta}`
        );

        const data = response.data;
        console.log(data);
        data.forEach((dato) => {
          dato.montoGenerado = Number(dato.montoGenerado.toFixed(2));
          dato.cantidad = Number(dato.cantidad.toFixed(2));
        });
        const iProd = data.filter((item) => item.tipo === "productos");
        const iServ = data.filter((item) => item.tipo === "servicios");
        setInfoProductos(iProd);
        setInfoServicios(iServ);
        setTipoFiltro("servicios");
        setData(iServ);
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };

    fetchData();
  }, [datePrincipal]);

  const minPrendas = 10;

  // Ordenar los datos de acuerdo al atributo especificado en valorizarX
  const sortedData = data.sort((a, b) => b[valorizarX] - a[valorizarX]);

  // Tomar solo los primeros 10 elementos después de ordenar
  const trimmedData =
    sortedData.length > minPrendas
      ? sortedData.slice(0, minPrendas)
      : sortedData;

  const newdata = trimmedData.sort((a, b) => a[valorizarX] - b[valorizarX]);

  // Primero ordenamos los datos de acuerdo al atributo especificado en valorizarX
  const ascendingData = data.sort((a, b) => a[valorizarX] - b[valorizarX]);

  // Luego tomamos solo los primeros 10 elementos después de ordenar
  const bottomData = ascendingData.slice(0, minPrendas).reverse();

  const exportToExcel = async () => {
    // const workbook = new ExcelJS.Workbook();
    // const worksheet = workbook.addWorksheet("Prueba");

    // // Establecer estilo de celda para la cabecera
    // const headerStyle = {
    //   font: { bold: true, size: 16 },
    //   fill: { type: "pattern", pattern: "solid", fgColor: { argb: "CCCCCC" } },
    // };

    // // Definir las columnas
    // worksheet.columns = [
    //   { header: "Nombre", key: "nombre", width: 15 },
    //   { header: "Efectivo", key: "efectivo", width: 30 },
    //   { header: "Descripción", key: "descripcion", width: 30 },
    //   { header: "Monto", key: "monto", width: 15 },
    // ];

    // // Combinar celdas para la cabecera
    // worksheet.mergeCells("B1:C1");
    // worksheet.getCell("B1").value = "Efectivo";
    // worksheet.getCell("B1").style = headerStyle;

    // // Agregar datos
    // PruebaData.forEach((persona) => {
    //   const nombre = persona.nombre;
    //   persona.Efectivo.forEach((pago, index) => {
    //     const row = {
    //       nombre: index === 0 ? nombre : "",
    //       descripcion: pago.descripcion,
    //       monto: pago.monto,
    //     };
    //     worksheet.addRow(row);
    //   });
    //   persona.Yape.forEach((pago) => {
    //     const row = {
    //       nombre: "",
    //       descripcion: pago.descripcion,
    //       monto: pago.monto,
    //     };
    //     worksheet.addRow(row);
    //   });
    //   persona.Tarjeta.forEach((pago) => {
    //     const row = {
    //       nombre: "",
    //       descripcion: pago.descripcion,
    //       monto: pago.monto,
    //     };
    //     worksheet.addRow(row);
    //   });
    // });

    // // Generar el archivo Excel
    // const buffer = await workbook.xlsx.writeBuffer();
    // const blob = new Blob([buffer], {
    //   type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    // });
    // const url = window.URL.createObjectURL(blob);

    // // Crear un enlace temporal y simular clic para descargar
    // const link = document.createElement("a");
    // link.href = url;
    // link.download = "prueba.xlsx";
    // link.click();

    // // Liberar el objeto URL creado
    // window.URL.revokeObjectURL(url);

    const fileName = `Reporte de ${
      tipoFiltro === "productos" ? "Productos" : "Servicios"
    }`;

    // Crear un nuevo libro de Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Datos");

    // Estilos para el encabezado
    const headerStyle = {
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "333333" }, // Color de fondo para la cabecera (gris oscuro)
      },
      font: {
        color: { argb: "FFFFFF" }, // Color del texto en la cabecera (blanco)
        bold: true, // Texto en negrita
      },
    };

    // Agregar la cabecera
    worksheet
      .addRow([
        "Codigo",
        `${tipoFiltro === "productos" ? "Producto" : "Servicio"}`,
        "Cantidad",
        "Monto Generado",
      ])
      .eachCell((cell) => {
        cell.fill = headerStyle.fill;
        cell.font = headerStyle.font;
      });
    data.forEach((item) => {
      worksheet.addRow([
        item.codigo,
        item.nombre,
        `${item.cantidad} ${item.simboloMedida} `,
        `${simboloMoneda} ${item.montoGenerado}`,
      ]);
    });

    worksheet.eachRow((row) => {
      row.alignment = {
        wrapText: true,
        horizontal: "center",
        vertical: "middle",
      };
    });

    let maxLengthColumns = 0;
    await worksheet.columns.forEach((column) => {
      column.eachCell({ includeEmpty: true }, (cell) => {
        const cellLength = cell.value ? cell.value.toString().length : 10;
        maxLengthColumns = Math.max(maxLengthColumns, cellLength);
      });
      column.width = maxLengthColumns + 2; // Agrega un espacio adicional
    });

    // Aplicar autofiltro a todas las columnas y filas
    const totalRows = worksheet.rowCount;
    const totalColumns = worksheet.columnCount;

    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: totalRows, column: totalColumns },
    };

    // Guardar el archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName + ".xlsx";
    a.click();

    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    if (!loading) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        exportToExcel();
      }, 2400);
    }
  };

  return (
    <div className="container-productos">
      <div className="header-p">
        <SwitchModel
          title="Valorizar por :"
          onSwitch="Cantidad" // TRUE
          offSwitch="Monto" // FALSE
          name="valorizacion"
          defaultValue={valorizarX === "cantidad" ? true : false}
          onChange={(value) => {
            if (value === true) {
              setValorizarX("cantidad");
            } else {
              setValorizarX("montoGenerado");
            }
          }}
        />
        <div>
          <h1>
            Reporte de {tipoFiltro === "productos" ? "Productos" : "Servicios"}
          </h1>
          <MonthPickerInput
            style={{ position: "relative", width: "100%", textAlign: "center" }}
            label="Seleccion de Fecha"
            placeholder="Pick date"
            value={datePrincipal}
            onChange={(date) => {
              setDatePrincipal(date);
            }}
            mx="auto"
            maw={400}
          />
        </div>
        <SwitchModel
          title="Tipo :"
          onSwitch="Producto" // TRUE
          offSwitch="Servicio" // FALSE
          name="tipoPromocion"
          defaultValue={tipoFiltro === "productos" ? true : false}
          onChange={(value) => {
            if (value === true) {
              setData(infoProductos);
              setTipoFiltro("productos");
            } else {
              setData(infoServicios);
              setTipoFiltro("servicios");
            }
          }}
        />
      </div>
      <div className="body-p">
        <div className="graf-prod">
          <h1>
            {tipoFiltro === "productos" ? "Productos" : "Servicios"} Mas
            Rentables
          </h1>
          <ResponsiveBar
            data={newdata} // Usar los datos ajustados
            keys={[
              `${
                valorizarX === "montoGenerado" ? "montoGenerado" : "cantidad"
              }`,
            ]}
            indexBy="nombre"
            layout="horizontal"
            margin={{ top: 10, right: 40, bottom: 60, left: 120 }}
            padding={0.3}
            groupMode="grouped"
            colors="#8DD3C7"
            borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
            axisTop={null}
            axisRight={null}
            label={(d) => {
              return d.value === 0 ? (
                <tspan x="15">{d.value}</tspan>
              ) : (
                <tspan x="50">
                  {valorizarX === "montoGenerado"
                    ? `${simboloMoneda} ${d.value}`
                    : `${d.value} ${d.data.simboloMedida} `}
                </tspan>
              );
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legendPosition: "middle",
              legendOffset: -40,
            }}
            axisBottom={{
              tickValues: 3,
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: `${
                valorizarX === "montoGenerado" ? "Monto" : "Cantidad"
              }`,
              legendPosition: "middle",
              legendOffset: 40,
            }}
            labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
            animate={true}
            motionStiffness={90}
            motionDamping={15}
            theme={{
              labels: {
                text: {
                  fontWeight: "bold", // Establece el peso del texto
                },
              },
              tooltip: {
                container: {
                  display: "none",
                },
              },
            }}
          />
        </div>
        <div className="list-products">
          <div className="table-wrapper">
            <table className="sticky-table">
              <thead>
                <tr>
                  <th>
                    {" "}
                    {tipoFiltro === "productos" ? "Productos" : "Servicios"}
                  </th>
                  <th>Cantidad</th>
                  <th>Monto Generado</th>
                </tr>
              </thead>
              <tbody>
                {data
                  .sort((a, b) => b[valorizarX] - a[valorizarX])
                  .map((item, index) => (
                    <tr key={index}>
                      <td>{item.nombre}</td>
                      <td>
                        {item.cantidad} {item.simboloMedida}
                      </td>
                      <td>
                        {simboloMoneda} {item.montoGenerado}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="action-t">
            <button
              className={`button_wrapper ${loading ? "loading" : ""}`}
              onClick={handleExport}
            >
              <div className="icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.75"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m0 0l6.75-6.75M12 19.5l-6.75-6.75"
                  />
                </svg>
              </div>
            </button>
          </div>
        </div>
        <div className="graf-prod">
          <h1>
            {tipoFiltro === "productos" ? "Productos" : "Servicios"} Menos
            Rentables
          </h1>
          <ResponsiveBar
            data={bottomData} // Usar los datos de los menos vendidos
            keys={[
              `${
                valorizarX === "montoGenerado" ? "montoGenerado" : "cantidad"
              }`,
            ]}
            indexBy="nombre"
            layout="horizontal"
            margin={{ top: 20, right: 120, bottom: 70, left: 40 }}
            padding={0.3}
            groupMode="grouped"
            colors="#d38d8d"
            borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
            label={(d) => {
              if (d.value === 0) {
                return <tspan x="-15">{d.value}</tspan>;
              } else {
                return valorizarX === "montoGenerado"
                  ? `${simboloMoneda} ${d.value}`
                  : `${d.value} ${d.data.simboloMedida}`;
              }
            }}
            axisTop={null}
            axisLeft={null}
            axisRight={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legendPosition: "middle",
              legendOffset: 40,
            }}
            axisBottom={{
              tickValues: 5,
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: `${
                valorizarX === "montoGenerado" ? "Monto" : "Cantidad"
              }`,
              legendPosition: "middle",
              legendOffset: 40,
            }}
            labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
            animate={true}
            motionStiffness={90}
            motionDamping={15}
            theme={{
              labels: {
                text: {
                  fontWeight: "bold", // Puedes cambiar 'bold' por el peso que desees, como 700.
                  fill: "#ffffff",
                },
              },
              tooltip: {
                container: {
                  display: "none",
                },
              },
            }}
            // Invertir la dirección de las barras agregando la propiedad 'reverse'
            reverse={true}
          />
        </div>
      </div>
    </div>
  );
};

export default Items;
