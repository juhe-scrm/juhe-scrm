package middleware

import (
	"bytes"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/hanson/go-toolbox/utils"
	"gorm.io/gorm/logger"
	"io"
	"log"
	"strings"
	"time"
)

type bodyLogWriter struct {
	gin.ResponseWriter
	body *bytes.Buffer
}

func (w bodyLogWriter) Write(b []byte) (int, error) {
	w.body.Write(b)
	return w.ResponseWriter.Write(b)
}

func Tracing() func(c *gin.Context) {
	return func(c *gin.Context) {

		reqHeaders := make([]string, 0)
		for k, v := range c.Request.Header {
			reqHeaders = append(reqHeaders, string(k)+"="+strings.Join(v, "&"))
		}
		traceId := fmt.Sprintf("%d%s", time.Now().UnixMicro(), utils.RandStr(8, utils.RandomStringModNumber))

		buf, _ := io.ReadAll(c.Request.Body)
		rdr1 := io.NopCloser(bytes.NewBuffer(buf))
		rdr2 := io.NopCloser(bytes.NewBuffer(buf)) //We have to create a new Buffer, because rdr1 will be read.

		c.Request.Body = rdr2
		b, _ := io.ReadAll(rdr1)
		//b := []byte{}
		log.Printf("req %strace_id:%s path:%s%s header:%+v, body:%s\n", logger.Green, traceId, c.Request.RequestURI, logger.Reset, strings.Join(reqHeaders, "&"), string(b))
		beginUnix := time.Now().UnixMilli()
		blw := &bodyLogWriter{body: bytes.NewBufferString(""), ResponseWriter: c.Writer}
		c.Writer = blw
		c.Next()
		endUnix := time.Now().UnixMilli()
		log.Printf("rsp %strace_id:%s%s body:%s [%dms]", logger.Green, traceId, logger.Reset, blw.body.String(), endUnix-beginUnix)
		//	var newCtx context.Context
		//	var span opentracing.Span
		//	spanCtx, err := opentracing.GlobalTracer().Extract(opentracing.HTTPHeaders, opentracing.HTTPHeadersCarrier(c.Request.Header))
		//	if err != nil {
		//		span, newCtx = opentracing.StartSpanFromContextWithTracer(c.Request.Context(), global.Tracer, c.Request.URL.Path)
		//	} else {
		//		span, newCtx = opentracing.StartSpanFromContextWithTracer(
		//			c.Request.Context(),
		//			global.Tracer,
		//			c.Request.URL.Path,
		//			opentracing.ChildOf(spanCtx),
		//			opentracing.Tag{Key: string(ext.Component), Value: "HTTP"},
		//		)
		//	}
		//	defer span.Finish()
		//
		//	var traceID string
		//	var spanID string
		//	var spanContext = span.Context()
		//	switch spanContext.(type) {
		//	case jaeger.SpanContext:
		//		jaegerContext := spanContext.(jaeger.SpanContext)
		//		traceID = jaegerContext.TraceID().String()
		//		spanID = jaegerContext.SpanID().String()
		//	}
		//	c.Set("X-Trace-ID", traceID)
		//	c.Set("X-Span-ID", spanID)
		//	c.Request = c.Request.WithContext(newCtx)
		//	c.Next()
	}
}
