export function toFiniteNumber(value?: string | number | null) {
  if (value === null || value === undefined || value === "") return undefined;
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : undefined;
}

export function distanceKm(lat1:number, lon1:number, lat2:number, lon2:number) {
  const radians=(value:number)=>value*Math.PI/180;
  const dLat=radians(lat2-lat1);
  const dLon=radians(lon2-lon1);
  const a=Math.sin(dLat/2)**2+Math.cos(radians(lat1))*Math.cos(radians(lat2))*Math.sin(dLon/2)**2;
  return 6371*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

export function approximateCoordinate(value:number) {
  return Math.round(value*100)/100;
}
